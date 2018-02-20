let initCellFn = function(scope, element) {
    let el = element[0],
        node = scope.node,
        index = scope.$index,
        focused = false;

    // event listeners
    el.addEventListener('mousedown', function(e) {
        scope.$applyAsync(() => scope.onCellMouseDown(e, node, index));
    });

    el.addEventListener('mouseover', function(e) {
        scope.$applyAsync(() => scope.onCellMouseOver(e, node, index));
    });

    el.addEventListener('mouseleave', function() {
        scope.$applyAsync(scope.onCellMouseLeave);
    });

    el.addEventListener('dblclick', function(e) {
        scope.$applyAsync(() => scope.onCellDoubleClick(e, node, index));
    });

    // helper functions
    let updateCellClass = function() {
        let classes = ['column', `column-${index}`, scope.cell.class];
        if (focused) classes.push('focused');
        if (scope.cell.underline) classes.push('highlight-reference');
        if (scope.cell.editing) classes.push('editing');
        el.className = classes.join(' ');
    };

    // watchers
    scope.$watch('cell.class', updateCellClass);
    scope.$watch('cell.underline', updateCellClass);
    scope.$watch('cell.editing', updateCellClass);

    scope.$watch('focusedIndex', function(newVal) {
        let shouldFocus = newVal === index;
        if (focused === shouldFocus) return;
        el.classList.toggle('focused');
        focused = shouldFocus;
    });
};

ngapp.directive('recordCell', function() {
    return {
        restrict: 'A',
        priority: 450,
        link: initCellFn
    }
});