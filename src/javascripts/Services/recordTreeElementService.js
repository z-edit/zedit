ngapp.service('recordTreeElementService', function(errorService) {
    this.buildFunctions = function(scope) {
        let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

        // scope functions
        scope.getRecord = function(index) {
            return (index ? scope.overrides[index - 1] : scope.record)
        };

        scope.getParentHandle = function(node, index) {
            return node.parent ? node.parent.handles[index] : scope.getRecord(index);
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
                return node.is_sorted ? '^' + scope.getElementArrayIndex(node, index) : '.';
            } else {
                return node.label.indexOf(' - ') == 4 ? node.label.substr(0, 4) : node.label;
            }
        };

        scope.addElement = function(node, index) {
            errorService.try(function() {
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
            if (uneditableValueTypes.contains(node.value_type)) return;
            scope.targetNode = node;
            scope.targetIndex = index - 1;
            scope.toggleEditModal(true);
        };

        scope.deleteElement = function(node) {
            errorService.try(function() {
                let handle = node.handles[scope.focusedIndex - 1];
                xelib.RemoveElement(handle);
                //xelib.Release(handle);
            });
        };

        scope.deleteElements = function() {
            scope.selectedNodes.forEach(scope.deleteElement);
            scope.clearSelection(true);
            scope.reload(); // TODO? This is kind of greedy, but it's simple
        };

        scope.canPaste = function(asOverride) {
            return false;
        };
    }
});