ngapp.service('mainTreeElementService', function(editModalFactory, errorService, settingsService) {
    this.buildFunctions = function(scope) {
        // helper variables
        let settings = settingsService.settings;

        // helper functions
        let getSortIndex = function(container, element) {
            let index = -1,
                elements = xelib.GetElements(container, '', true);
            try {
                index = handles.findIndex(function(h) {
                    return xelib.ElementEquals(h, element)
                });
            } finally {
                elements.forEach(xelib.Release);
            }
            return index;
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

        // scope functions
        scope.addElement = function(node, key) {
            errorService.try(function() {
                let signature = key.split(' ')[0],
                    element = xelib.AddElement(node.handle, signature);
                if (node.expanded) {
                    let insertionIndex = getInsertionIndex(node, element);
                    if (insertionIndex === -1) return;
                    scope.tree.splice(insertionIndex, 0, {
                        handle: element,
                        depth: node.depth + 1,
                        parent: node
                    });
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
            let modalOptions = editModalFactory.addFile(scope);
            scope.$emit('openModal', 'edit', modalOptions);
        };

        scope.deleteElement = function(node) {
            errorService.try(function() {
                scope.$root.$broadcast('deleteElement', node.handle, node.element_type);
                xelib.RemoveElement(node.handle);
                xelib.Release(node.handle);
                if (node.expanded) scope.collapseNode(node);
                scope.tree.remove(node);
                if (hasNoChildren(node.parent)) {
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
                let message = `Delete ${scope.selectedNodes.length} elements?`;
                scope.selectedNodes.forEach(function(node, index) {
                    if (index > 7) {
                        if (index === 8) message += '\r\n  - ... etc.';
                        return;
                    }
                    message += `\r\n  - ${xelib.Name(node.handle)}`;
                });
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
            let doDelete = () => scope.selectedNodes.forEach(scope.deleteElement);
            if (settings.treeView.promptOnDeletion) {
                scope.deletionPrompt().then(function(result) {
                    if (result) doDelete();
                });
            } else {
                doDelete();
            }
        };

        scope.changeFileName = function(node) {
            let modalOptions = editModalFactory.renameFile(node, scope);
            scope.$emit('openModal', 'edit', modalOptions);
        };

        scope.changeFileAuthor = function(node) {
            let modalOptions = editModalFactory.changeFileAuthor(node, scope);
            scope.$emit('openModal', 'edit', modalOptions);
        };

        scope.changeFileDescription = function(node) {
            let modalOptions = editModalFactory.changeFileDescription(node, scope);
            scope.$emit('openModal', 'edit', modalOptions);
        };

        scope.canPaste = function(asOverride) {
            return false;
        };
    }
});