ngapp.controller('spreadsheetViewController', function($scope, $element, $timeout, columnsService, treeService, spreadsheetViewService, nodeSelectionService, nodeColumnService, hotkeyService, typeToSearchService, contextMenuService, contextMenuFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // helper variables
    $scope.columns = columnsService.getColumns('spreadsheetView');
    $scope.contextMenuItems = contextMenuFactory.spreadsheetViewItems;

    // inherited functions
    spreadsheetViewService.buildFunctions($scope);
    typeToSearchService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope, true);
    nodeColumnService.buildFunctions($scope, '.spreadsheet-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onSpreadsheetKeyDown', 'spreadsheetView');

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            viewName: 'spreadsheetView'
        });
    };

    $scope.onNodeDoubleClick = function(e, node) {
        $scope.open(node);
    };

    $scope.onNodeDrag = function(node) {
        $scope.$root.dragData = {
            source: 'spreadsheetView',
            node: node
        };
        return true;
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    // event handling
    $scope.$on('recordUpdated', (e, element) => {
        let node = $scope.getNodeForElement(element);
        if (node) $scope.rebuildNode(node);
    });
    $scope.$on('nodeUpdated', (e, node) => {
        $scope.rebuildNode(node);
        $scope.setNodeModified(node);
    });
    $scope.$on('reloadGUI', $scope.reload);
    $scope.$on('getSelectedNodes', function(e) {
        e.targetScope.selectedNodes = $scope.selectedNodes;
    });
    $scope.$on('rebuildColumns', function() {
        $scope.buildColumns();
        $scope.reload();
    });

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
});