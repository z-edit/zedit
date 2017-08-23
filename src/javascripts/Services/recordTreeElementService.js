ngapp.service('recordTreeElementService', function() {
    this.buildFunctions = function(scope) {
        let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

        scope.addElement = function(node, index) {
            // TODO
        };

        scope.editElement = function(node, index) {
            if (uneditableValueTypes.contains(node.value_type)) return;
            scope.targetNode = node;
            scope.targetIndex = index - 1;
            scope.toggleEditModal(true);
        };
    }
});