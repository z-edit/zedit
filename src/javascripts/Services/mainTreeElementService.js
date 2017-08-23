ngapp.service('mainTreeElementService', function(editModalFactory, errorService) {
    this.buildFunctions = function(scope) {
        scope.addElement = function(node, key) {
            errorService.try(function() {
                let signature = key.split(' ')[0],
                    element = xelib.AddElement(node.handle, signature);
                scope.rebuildNode(node);
                if (!node.expanded) scope.expandNode(node);
                scope.navigateToElement(element, true);
            });
        };

        let hasNoChildren = function(node) {
            let checkIndex = scope.tree.indexOf(node) + 1;
            return scope.tree[checkIndex].depth <= node.depth;
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