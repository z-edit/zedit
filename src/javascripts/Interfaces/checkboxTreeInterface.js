ngapp.factory('checkboxTreeInterface', function() {
    const UNCHECKED = 0;
    const CHECKED = 1;

    // PUBLIC
    return function(scope) {
        scope.updateChildNodes = function(node, newState) {
            scope.getChildNodes(node, true).forEach(child => {
                child.state = newState;
            });
        };

        scope.toggleCheckbox = function(node) {
            let newState = node.state ? UNCHECKED : CHECKED;
            scope.updateChildNodes(node, newState);
            node.state = newState;
            scope.$emit('setNodeState', node, newState);
        };

        scope.updateNodeState = function(node) {
            scope.$emit('updateNodeState', node);
        };

        scope.onCheckboxClick = function(node, e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            scope.$emit('checkboxClick', node);
        };

        scope.$on('checkboxClick', function(e, node) {
            scope.$applyAsync(() => scope.toggleCheckbox(node));
        });
    };
});
