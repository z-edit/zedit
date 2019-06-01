let initNodeFn = function(scope, element) {
    let el = element[0];

    // helper functions
    let updateClass = function() {
        el.className = `${el.className} ${scope.node.class}`;
    };

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
    if (scope.getNodeData) scope.getNodeData(scope.node);
    if (scope.node.class) updateClass();
};

ngapp.directive('treeNode', function() {
    return {
        restrict: 'A',
        priority: 450,
        link: initNodeFn
    }
});
