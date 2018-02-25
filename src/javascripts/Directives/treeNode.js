let initNodeFn = function(scope, element) {
    let el = element[0];

    // event listeners
    el.addEventListener('mousedown', function(e) {
        scope.$applyAsync(() => scope.onNodeMouseDown(e, scope.node));
    });

    el.addEventListener('dblclick', function(e) {
        scope.$applyAsync(() => scope.onNodeDoubleClick(e, scope.node));
    });

    scope.$watch('node.selected', function(newVal) {
        el.classList[newVal ? 'add' : 'remove']('selected');
    });

    // initialize node data
    if (scope.node.hasData) return;
    scope.getNodeData(scope.node);
    el.className = `${el.className} ${scope.node.class}`;
};

ngapp.directive('treeNode', function() {
    return {
        restrict: 'A',
        priority: 450,
        link: initNodeFn
    }
});
