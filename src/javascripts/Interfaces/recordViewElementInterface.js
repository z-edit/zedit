ngapp.factory('recordViewElementInterface', function(errorService, settingsService, clipboardService, nodeHelpers) {
    return function(scope) {
        let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray,
                xelib.vtStruct],
            trueValueTypes = [xelib.vtBytes, xelib.vtNumber, xelib.vtText,
                xelib.vtString, xelib.vtReference],
            settings = settingsService.settings;

        let canEdit = function(node, index) {
            return node.handles[index - 1] > 0 &&
                !uneditableValueTypes.includes(node.value_type) &&
                xelib.GetIsEditable(scope.getRecord(index - 1));
        };

        let getCopyNodes = function() {
            let index = scope.focusedIndex - 1;
            return scope.selectedNodes
                .filter(node => node.handles[index] > 0)
                .map(node => ({
                    handle: xelib.GetElement(node.handles[index]),
                    label: node.label,
                    parent: node.parent,
                    value_type: node.value_type
                }));
        };

        let parentArrayMatches = function(nodes, selectedNode) {
            return nodes.reduce((matches, node) => {
                return matches && node.parent &&
                    node.parent.value_type === xelib.vtArray &&
                    selectedNode.label === node.parent.label;
            }, true);
        };

        let pasteTo = function(sources, target, record) {
            errorService.try(() => {
                sources.forEach(src => xelib.CopyElement(src, target));
            });
            // update view
            scope.reload(); // TODO? This is kind of greedy, but it's simple
            scope.$root.$broadcast('recordUpdated', record);
        };

        // scope functions
        scope.getFileName = function(index) {
            return scope.columns[index].label;
        };

        scope.getRecord = function(index) {
            if (angular.isUndefined(index)) index = scope.focusedIndex - 1;
            return (index ? scope.overrides[index - 1] : scope.record)
        };

        scope.getParentHandle = function(node, index) {
            return node.parent ? node.parent.handles[index] :
                scope.getRecord(index);
        };

        scope.getElementArrayIndex = function(node, index) {
            let nodeIndex = scope.tree.indexOf(node),
                counter = 0,
                targetDepth = node.depth;
            for (let i = nodeIndex - 1; i > 0; i--) {
                let n = scope.tree[i];
                if (n.depth < targetDepth) return counter;
                if (n.depth === targetDepth && n.handles[index]) counter++;
            }
        };

        scope.getNewElementPath = function(node, index) {
            if (node.parent && node.parent.value_type === xelib.vtArray) {
                return '.';
            } else {
                let n = node.label.indexOf(' - ');
                return n === 4 ? node.label.substr(0, 4) : node.label;
            }
        };

        scope.addElement = function(node, index) {
            errorService.try(() => {
                let handle = node.handles[index];
                if (handle) { // append element to array
                    if (node.value_type !== xelib.vtArray) return;
                    xelib.AddElement(handle, '.');
                } else { // create element in struct
                    handle = scope.getParentHandle(node, index);
                    if (!handle) return;
                    let path = scope.getNewElementPath(node, index);
                    xelib.AddElement(handle, path);
                }
                scope.reload(); // TODO? This is kind of greedy, but it's simple
                scope.$root.$broadcast('recordUpdated', scope.getRecord(index));
            });
        };

        scope.editElement = function(node, index) {
            if (!canEdit(node, index)) return;
            scope.$emit('openModal', 'editValue', {
                targetNode: node,
                targetIndex: index - 1,
                record: scope.record,
                overrides: scope.overrides
            });
        };

        scope.editElementInline = function(node, index) {
            if (scope.$root.modalActive || !canEdit(node, index)) return;
            node.cells[index].editing = true;
        };

        scope.deleteElement = function(node) {
            errorService.try(() => {
                let handle = node.handles[scope.focusedIndex - 1];
                xelib.RemoveElement(handle);
            });
        };

        scope.deletionPromptMessage = function() {
            let recordIndex = scope.focusedIndex - 1,
                recordName = xelib.Name(scope.getRecord(recordIndex)),
                fileName = scope.getFileName(recordIndex);
            if (scope.selectedNodes.length === 1) {
                let node = scope.selectedNodes[0],
                    path = xelib.LocalPath(node.handles[recordIndex]);
                return `Delete ${path} from ${recordName} in ${fileName}?`;
            } else {
                let message = `Delete ${scope.selectedNodes.length} elements from ${recordName} in ${fileName}?`;
                scope.selectedNodes.slice(0, 8).forEach(node => {
                    message += `\r\n  - ${xelib.LocalPath(node.handles[recordIndex])}`;
                });
                if (scope.selectedNodes.length > 8) {
                    message += '\r\n  - ... etc.';
                }
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
            let record = scope.getRecord();
            if (!xelib.GetIsEditable(record)) return;
            let doDelete = (confirmed = true) => {
                if (!confirmed) return;
                scope.selectedNodes.forEach(scope.deleteElement);
                scope.clearSelection(true);
                scope.reload(); // TODO? This is kind of greedy, but it's simple
                scope.$root.$broadcast('recordUpdated', record);
            };
            let shouldPrompt = settings.recordView.promptOnDeletion;
            shouldPrompt ? scope.deletionPrompt().then(doDelete) : doDelete();
        };

        scope.copyNodes = function() {
            let nodesToCopy = getCopyNodes();
            if (nodesToCopy.length === 0) return;
            clipboardService.copyNodes('recordView', nodesToCopy);
            let textToCopy = nodesToCopy
                .filter(node => trueValueTypes.includes(node.value_type))
                .map(node => xelib.GetValue(node.handle))
                .join('\r\n');
            clipboardService.copyText(textToCopy)
        };

        scope.pasteNodes = function(pasteIntoRecord) {
            if (!scope.canPaste(pasteIntoRecord)) return;
            let record = scope.getRecord(),
                nodes = clipboardService.getNodes(),
                sources = nodes.mapOnKey('handle');
            // paste into record
            if (pasteIntoRecord)
                return pasteTo(sources, record, record);
            // paste into array
            let selectedNode = scope.selectedNodes.last(),
                target = selectedNode.handles[scope.focusedIndex - 1],
                copyType = nodes[0].value_type,
                selectedType = selectedNode.value_type;
            if (selectedType === xelib.vtArray && copyType !== xelib.vtArray)
                return pasteTo(sources, target, record);
            // paste directly
            trueValueTypes.includes(selectedType) ?
                xelib.SetValue(target, '', xelib.GetValue(sources[0])) :
                xelib.SetElement(target, sources[0]);
            // update view
            scope.reload(); // TODO? This is kind of greedy, but it's simple
            scope.$root.$broadcast('recordUpdated', record);
        };

        scope.copyPaths = function() {
            let str = scope.selectedNodes.mapOnKey('first_handle')
                .map(h => xelib.LocalPath(h)).join('\r\n');
            clipboardService.copyText(str);
        };

        scope.canCopy = function() {
            if (scope.selectedNodes.length === 0) return;
            for (let node of scope.selectedNodes)
                if (nodeHelpers.isRecordHeader(node)) return;
            return getCopyNodes().length > 0;
        };

        scope.canPaste = function(pasteIntoRecord) {
            if (!clipboardService.hasClipboard()) return;
            if (clipboardService.getCopySource() !== 'recordView') return;
            if (scope.focusedIndex < 0) return;
            if (pasteIntoRecord) return true;
            let nodes = clipboardService.getNodes(),
                selectedNode = scope.selectedNodes.last(),
                copyType = nodes[0].value_type,
                selectedType = selectedNode.value_type;
            if (selectedType === xelib.vtArray && copyType !== xelib.vtArray)
                return parentArrayMatches(nodes, selectedNode);
            if (trueValueTypes.includes(selectedType)) return true;
            return selectedType === copyType &&
                nodes[0].label === selectedNode.label;
        };
    }
});
