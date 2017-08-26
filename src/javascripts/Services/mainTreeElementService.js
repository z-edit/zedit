ngapp.service('mainTreeElementService', function(editModalFactory, errorService) {
    this.buildFunctions = function(scope) {
        // helper functions
        let getSortIndex = function(container, element) {
            let index = -1;
            xelib.WithHandles(xelib.GetElements(container, '', true), function(handles) {
                index = handles.findIndex((h) => { return xelib.ElementEquals(h, element) });
            });
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
                    scope.expandNode(node);
                }
                scope.navigateToElement(element, true);
                scope.setNodeModified(node);
                scope.$root.$broadcast('nodeAdded');
            });
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

        scope.deleteElements = function() {
            scope.selectedNodes.forEach(scope.deleteElement);
        };

        scope.changeFileName = function(node) {
            let modalOptions = editModalFactory.renameFile(node, scope);
            errorService.try(() => scope.$emit('openEditModal', modalOptions));
        };

        scope.changeFileAuthor = function(node) {
            let modalOptions = editModalFactory.changeFileAuthor(node, scope);
            errorService.try(() => scope.$emit('openEditModal', modalOptions));
        };

        scope.changeFileDescription = function(node) {
            let modalOptions = editModalFactory.changeFileDescription(node, scope);
            errorService.try(() => scope.$emit('openEditModal', modalOptions));
        };

        scope.canPaste = function(asOverride) {
            return false;
        };
    }
});