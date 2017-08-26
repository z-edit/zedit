ngapp.service('recordTreeElementService', function(errorService) {
    this.buildFunctions = function(scope) {
        let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

        // scope functions
        scope.addElement = function(node, index) {
            errorService.try(function() {
                let handle = node.handles[index],
                    record = index ? scope.overrides[index - 1] : scope.record;
                if (handle) {
                    // append element to array
                    xelib.AddElement(handle, '.');
                } else {
                    // create element in struct
                    handle = node.parent ? node.parent.handles[index] : record;
                    if (!handle) return; // this should never happen
                    let path = node.label.indexOf(' - ') == 4 ? node.label.substr(0, 4) : node.label;
                    xelib.AddElement(handle, path);
                }
                scope.reload(); // TODO? This is kind of greedy, but it's simple
                scope.$root.$broadcast('recordUpdated', record);
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