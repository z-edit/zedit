ngapp.controller('referencedByViewController', function($scope, $element, $timeout, htmlHelpers, gridService, referencedByViewService, columnsService, hotkeyService, nodeSelectionService, treeColumnService, contextMenuService, contextMenuFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    $scope.allColumns = columnsService.getColumnsForView('referencedByView');
    $scope.contextMenuItems = contextMenuFactory.referencedByViewItems;

    // inherited functions
    gridService.buildFunctions($scope, $element);
    referencedByViewService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.referenced-by-view', true);
    nodeSelectionService.buildFunctions($scope, false);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'referencedByView');

    $scope.open = function(node) {
        let recordView = $scope.view.linkedRecordView;
        if (recordView) {
            recordView.scope.record = xelib.GetElementEx(node.handle, '');
        } else {
            $scope.record = xelib.GetElementEx(node.handle, '');
        }
    };

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            viewName: 'referencedByView'
        });
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        $scope.open(node);
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    $scope.releaseHandles = function(oldValue) {
        xelib.Release(oldValue);
    };

    // initialization
    $scope.$on('reloadGUI', function() {
        if (!$scope.record) return;
        if (!xelib.HasElement($scope.record)) {
            $scope.releaseHandles($scope.record);
            $scope.record = undefined;
        } else {
            $scope.buildColumns();
            $scope.reload();
        }
    });
    $scope.$on('rebuildColumns', function() {
        $scope.buildColumns();
        $scope.reload();
    });
    $scope.$on('builtReferences', $scope.reload);

    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue === newValue) return;
        if (oldValue) $scope.releaseHandles(oldValue);
        if (!newValue) {
            $scope.view.label = 'Referenced By View';
            return;
        }
        $scope.view.label = xelib.Name(newValue);
        $scope.focusedIndex = -1;
        $scope.buildColumns();
        $scope.buildTree();
        $timeout($scope.resolveElements, 100);
    });

    $scope.showAddressBar = false;
    $scope.sort = { column: 'Record', reverse: false };
    $timeout($scope.linkToRecordView, 100);
});
