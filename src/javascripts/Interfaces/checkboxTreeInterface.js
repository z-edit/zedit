ngapp.factory('checkboxTreeInterface', function() {
    const CHECKBOX_UNCHECKED = 0;
    const CHECKBOX_CHECKED = 1;
    const CHECKBOX_INDETERMINATE = 2;

    let shouldCheck = function(node) {
        return node.state === CHECKBOX_UNCHECKED && node.process;
    };

    let isIndeterminate = function(element) {
        return !element.process || element.elements.find(e => {
            return isIndeterminate(e);
        });
    };

    let updateParentState = function(node) {
        node.state = CHECKBOX_UNCHECKED;
        node.elements && node.elements.forEach(e => {
            if (e.process) node.data.process = true;
            if (isIndeterminate(e)) node.state = CHECKBOX_INDETERMINATE;
        });
        if (shouldCheck(node)) node.state = CHECKBOX_CHECKED;
    };

    let updateParents = function(parent) {
        if (!parent) return;
        updateParentState(parent);
        updateParents(parent.parent);
    };

    let updateChildren = function(node, newState) {
        if (!node.data.elements) return;
        node.data.elements.forEach(function toggleElement(e) {
            e.process = newState;
            if (!e.elements) return;
            e.elements.forEach(toggleElement);
        });
    };

    // PUBLIC
    return function(scope) {
        scope.toggleProcess = function(node, e) {
            e.preventDefault();
            let newState = !node.data.process;
            updateChildren(node, newState);
            updateParents(node);
            node.data.process = newState;
            node.state = newState ? CHECKBOX_CHECKED : CHECKBOX_UNCHECKED;
        };
    };
});
