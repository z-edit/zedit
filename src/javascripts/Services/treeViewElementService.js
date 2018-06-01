ngapp.service('treeViewElementService', function($q, editModalFactory, errorService, settingsService, clipboardService, xelibService, referenceService, nodeHelpers) {
    this.buildFunctions = function(scope) {
        // helper variables
        let settings = settingsService.settings;

        // helper functions
        let findElementIndex = function(elements, element) {
            return elements.findIndex(h => xelib.ElementEquals(h, element));
        };

        let getSortIndex = function(container, element) {
            return xelib.WithHandles(xelib.GetElements(container, '', true),
                    elements => findElementIndex(elements, element));
        };

        let getInsertionIndex = function(node, element) {
            let startIndex = scope.tree.indexOf(node),
                targetDepth = node.depth + 1,
                sortIndex = getSortIndex(node.handle, element),
                childIndex = 0;
            if (sortIndex === -1) return -1;
            for (let i = startIndex + 1; i < scope.tree.length; i++) {
                let n = scope.tree[i];
                if (n.depth < targetDepth) return -1;
                if (n.depth === targetDepth) childIndex++;
                if (childIndex === sortIndex) return i + 1;
            }
        };

        let copyElement = function(element, file, asOverride) {
            xelib.AddRequiredMasters(element, file, !asOverride);
            return xelib.CopyElement(element, file, !asOverride);
        };


        let getRecordHandles = function(nodes) {
            let records = [];
            nodes.forEach(node => {
                if (nodeHelpers.isRecordNode(node)) {
                    records.push(node.handle);
                    if (!xelib.HasElement(node.handle, 'Child Group')) return;
                }
                records.push(...xelib.GetRecords(node.handle, '', true));
            });
            return records;
        };

        let getFileHandles = function(filenames) {
            return filenames.map(filename => xelib.FileByName(filename));
        };

        let copyRecordsToFile = function(records, file, asOverride, smartCopy) {
            xelib.WithHandles(records.map(handle => {
                return copyElement(handle, file, asOverride);
            }), copies => {
                if (smartCopy) xelibService.fixReferences(records, copies);
            });
        };

        let copyIntoFiles = function(filenames, asOverride, smartCopy) {
            xelib.WithHandles([
                getRecordHandles(scope.selectedNodes),
                getFileHandles(filenames)
            ], function([recordHandles, fileHandles]) {
                fileHandles.forEach(file => {
                    copyRecordsToFile(recordHandles, file, asOverride, smartCopy);
                });
                scope.$root.$broadcast('reloadGUI');
            });
        };

        let addFileAndCopy = function({filenames, asOverride, smartCopy}) {
            let index = filenames.indexOf('< new file >');
            if (index > -1) {
                editModalFactory.addFile(scope, fileName => {
                    xelib.Release(xelib.AddFile(fileName));
                    filenames.splice(index, 1, fileName);
                    copyIntoFiles(filenames, asOverride, smartCopy);
                });
            } else {
                copyIntoFiles(filenames, asOverride, smartCopy);
            }
        };

        let pasteElements = function(parent, elements, asNew) {
            xelib.WithHandle(xelib.GetElementFile(parent), file => {
                elements.forEach(element => {
                    xelib.AddRequiredMasters(element, file, asNew);
                    xelib.CopyElement(element, file, asNew);
                });
            });
        };

        let canAdd = function(nodes, dstNode) {
            let nodeSignature = xelib.Signature(nodes[0].handle),
                addList = xelib.GetAddList(dstNode.handle),
                allowedSignatures = addList.map(item => item.slice(0, 4));
            return allowedSignatures.includes(nodeSignature);
        };

        let canPasteIntoGroup = function(selectedType, nodes) {
            if (selectedType === xelib.etGroupRecord) {
                return scope.selectedNodes.reduce((b, node) => {
                    return b && nodeHelpers.isFileNode(node) &&
                        canAdd(nodes, node);
                }, true);
            } else if (selectedType === xelib.etMainRecord) {
                if (scope.selectedNodes.length !== 1) return;
                let targetNode = scope.selectedNodes[0].parent;
                return canAdd(nodes, targetNode);
            }
        };

        let insertNode = function(parent, element) {
            let insertionIndex = getInsertionIndex(parent, element);
            if (insertionIndex === -1) return;
            scope.tree.splice(insertionIndex, 0, {
                handle: element,
                depth: parent.depth + 1,
                parent: parent
            });
            return true;
        };

        let getCopyNodes = function() {
            return scope.selectedNodes.map(node => ({
                handle: xelib.GetElement(node.handle),
                parent: node.parent
            }))
        };

        // scope functions
        scope.addElement = function(node, key) {
            errorService.try(() => {
                let signature = key.split(' ')[0],
                    element = xelib.AddElement(node.handle, signature);
                if (node.expanded) {
                    if (!insertNode(node, element)) return;
                } else {
                    if (!node.can_expand) node.can_expand = true;
                    scope.expandNode(node);
                }
                scope.navigateToElement(element, true);
                scope.setNodeModified(node);
                scope.$root.$broadcast('nodeAdded');
            });
        };

        scope.addFile = function() {
            editModalFactory.addFile(scope);
        };

        scope.deleteElement = function(node) {
            if (node.element_type === xelib.etFile) return;
            errorService.try(() => {
                scope.$root.$broadcast('deleteElement', node.handle, node.element_type);
                xelib.RemoveElement(node.handle);
                xelib.Release(node.handle);
                if (node.expanded) scope.collapseNode(node);
                scope.tree.remove(node);
                if (scope.hasNoChildren(node.parent)) {
                    scope.collapseNode(node.parent);
                    node.parent.can_expand = false;
                }
                scope.setNodeModified(node);
            });
        };

        scope.deletionPromptMessage = function() {
            if (scope.selectedNodes.length === 1) {
                let node = scope.selectedNodes[0];
                return `Delete ${xelib.Name(node.handle)}?`;
            } else {
                let overflow = scope.selectedNodes.length > 7,
                    nodes = scope.selectedNodes.slice(7),
                    message = nodes.reduce((message, node) => {
                        return message + `\r\n  - ${xelib.Name(node.handle)}`;
                    }, `Delete ${scope.selectedNodes.length} elements?`);
                if (overflow) message += `\r\n - ... etc.`;
                return message;
            }
        };

        scope.deletionPrompt = function() {
            return scope.$root.prompt({
                title: 'Delete elements',
                prompt: scope.deletionPromptMessage(),
                type: 'yesNo'
            });
        };

        scope.deleteElements = function() {
            let doDelete = (confirmed = true) => {
                if (!confirmed) return;
                scope.selectedNodes.forEach(scope.deleteElement);
            };
            let shouldPrompt = settings.treeView.promptOnDeletion;
            shouldPrompt ? scope.deletionPrompt().then(doDelete) : doDelete();
        };

        scope.enableEditing = function() {
            scope.selectedNodes.forEach(node => {
                if (node.element_type !== xelib.etFile) return;
                xelib.SetIsEditable(node.handle, true);
            });
        };

        scope.buildReferences = function() {
            let fileHandles = scope.selectedNodes
                .filter(nodeHelpers.isFileNode)
                .mapOnKey('handle');
            referenceService.buildReferences(fileHandles);
        };

        scope.refactor = function() {
            let node = scope.selectedNodes.last(),
                isFile = nodeHelpers.isFileNode(node),
                modal = `refactor${isFile ? 'File' : 'Records'}`;
            scope.$emit('openModal', modal, { nodes: scope.selectedNodes });
        };

        scope.savePluginAs = function() {
            let node = scope.selectedNodes.last();
            editModalFactory.saveFileAs(node, scope);
        };

        scope.addMasters = function(node) {
            scope.$emit('openModal', 'addMasters', { handle : node.handle });
        };

        scope.copyNodes = function() {
            if (!scope.canCopy()) return;
            clipboardService.copyNodes('treeView', getCopyNodes());
        };

        scope.copyInto = function() {
            if (!scope.canCopy()) return;
            let action = $q.defer();
            scope.$emit('openModal', 'copyInto', {
                nodes: scope.selectedNodes,
                action: action
            });
            action.promise.then(addFileAndCopy);
        };

        scope.copyPaths = function() {
            let str = scope.selectedNodes.mapOnKey('handle')
                .map(h => xelib.Path(h)).join('\r\n');
            clipboardService.copyText(str);
        };

        scope.pasteNodes = function(asNew) {
            if (!scope.canPaste()) return;
            let nodes = clipboardService.getNodes(),
                elements = nodes.mapOnKey('handle');
            scope.selectedNodes.forEach(node =>
                pasteElements(node.handle, elements, asNew));
            scope.reload();
        };

        scope.canCopy = function() {
            let showFileHeaders = settings.treeView.showFileHeaders;
            if (scope.selectedNodes.length === 0) return;
            for (let node of scope.selectedNodes) {
                if (nodeHelpers.isFileNode(node)) return;
                if (showFileHeaders && node.fid === 0) return;
            }
            return true;
        };

        scope.canPaste = function() {
            if (!clipboardService.hasClipboard()) return;
            if (clipboardService.getCopySource() !== 'treeView') return;
            if (scope.selectedNodes.length === 0) return;
            let nodes = clipboardService.getNodes(),
                nodeParentType = nodes[0].parent.element_type,
                selectedType = scope.selectedNodes[0].element_type;
            if (selectedType === xelib.etFile) return true;
            if (nodeParentType === xelib.etGroupRecord)
                return canPasteIntoGroup(selectedType, nodes)
        };
    }
});
