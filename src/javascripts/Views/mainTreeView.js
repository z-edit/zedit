var mainTreeViewController = function($scope, $element, $timeout, columnsService, treeService, mainTreeService, nodeSelectionService, treeColumnService, hotkeyService, hotkeyFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper variables
    let hotkeys = hotkeyFactory.mainTreeHotkeys();
    $scope.allColumns = columnsService.columns;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    mainTreeService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.main-tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', hotkeys);

    // scope functions
    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
        if (node.element_type !== xelib.etMainRecord) return;
        if (data.linkedScope) {
            // we do this to get a new handle for the record to be used
            // with the record view
            data.linkedScope.record = xelib.GetElement(node.handle);
        }
    };

    $scope.handleEnter = function(e) {
        $scope.onNodeDoubleClick(e, $scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
};