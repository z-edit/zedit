ngapp.factory('checkboxTreeInterface', function() {
    const UNCHECKED = 0;
    const CHECKED = 1;
    const INDETERMINATE = 2;

    let isIndeterminate = function(foundStates) {
        return foundStates[2] || foundStates[0] && foundStates[1];
    };

    let getStateFromChildren = function(element) {
        let foundStates = [false, false, false];
        for (let i = 0; i < element.elements.length; i++) {
            foundStates[getState(element.elements[i])] = true;
            if (isIndeterminate(foundStates)) return INDETERMINATE;
        }
        return foundStates.findIndex(n => n);
    };

    let getState = function(element) {
        if (element.elements) return getStateFromChildren(element);
        return element.process ? CHECKED : UNCHECKED;
    };

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
            node.state = newState ? CHECKED : UNCHECKED;
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
