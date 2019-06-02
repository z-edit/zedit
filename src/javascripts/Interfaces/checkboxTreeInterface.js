ngapp.factory('checkboxTreeInterface', function() {
    const CHECKBOX_UNCHECKED = 0;
    const CHECKBOX_CHECKED = 1;
    const CHECKBOX_INDETERMINATE = 2;

    let useIndeterminate = function(foundNodes) {
        return foundNodes[0] + foundNodes[1] + foundNodes[2] > 1;
    };

    let getStateFromChildren = function(element) {
        let foundStates = [0, 0, 0];
        element.elements.find(e => {
            foundStates[getState(e)] = 1;
            return useIndeterminate(foundStates);
        });
        return useIndeterminate(foundStates) ?
            CHECKBOX_INDETERMINATE :
            foundStates.findIndex(n => n);
    };

    let getState = function(element) {
        if (element.elements) return getStateFromChildren(element);
        return element.process ?
            CHECKBOX_CHECKED :
            CHECKBOX_UNCHECKED;
    };

    // set parent state to indeterminate if a child is set to
    // indeterminate or not all children are set to process
    // and not all children are set to not process
    let updateState = function(node) {
        node.state = getState(node.data);
        node.data.process = node.state > 0;
    };

    let updateParents = function(parent) {
        if (!parent) return;
        updateState(parent);
        updateParents(parent.parent);
    };

    // PUBLIC
    return function(scope) {
        let updateChildElements = function(element, newState) {
            if (!element.elements) return;
            element.elements.forEach(e => {
                e.process = newState;
                updateChildElements(e, newState);
            });
        };

        let updateChildNodes = function(node, newState) {
            scope.getChildNodes(node, true).forEach(child => {
                child.state = +newState;
            });
        };

        scope.toggleProcess = function(node) {
            let newState = !node.data.process;
            updateChildNodes(node, newState);
            updateChildElements(node.data, newState);
            node.data.process = newState;
            node.state = newState ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED;
            updateParents(node.parent);
        };

        scope.onCheckboxClick = function(node, e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            scope.$applyAsync(() => scope.toggleProcess(node));
        };

        scope.getNodeState = getState;
    };
});
