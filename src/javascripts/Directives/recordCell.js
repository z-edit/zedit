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

    scope.$watch('cell.class', function(newVal) {
        el.className = `column column-${index} ${newVal}`;
        if (focused) el.classList.add('focused');
    });

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