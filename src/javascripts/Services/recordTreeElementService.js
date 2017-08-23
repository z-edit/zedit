ngapp.service('recordTreeElementService', function() {
    this.buildFunctions = function(scope) {
        scope.addElement = function(node, index) {
            // TODO
        };

        scope.editElement = function(node, index) {
            scope.targetNode = node;
            scope.targetIndex = index - 1;
            scope.toggleEditModal(true);
        };
    }
});