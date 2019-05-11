ngapp.controller('referencedByViewController', function($scope, $element, $timeout, gridService, referencedByViewService, referenceService, columnsService, hotkeyService, nodeSelectionService, nodeColumnService, contextMenuService) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // initialization
    $scope.canSortAll = true;
    $scope.sort = { column: 'Record', reverse: false };
    $scope.allColumns = columnsService.getColumns('referencedByView');

    // inherited functions
    gridService.buildFunctions($scope, $element);
    nodeSelectionService.buildFunctions($scope, false);
    referencedByViewService.buildFunctions($scope);
    nodeColumnService.buildFunctions($scope, '.referenced-by-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onGridKeyDown', 'referencedByView');
    contextMenuService.buildFunctions($scope, 'referencedByView');

    // helper functions
    let getAllReferencesBuilt = function() {
        $scope.allReferencesBuilt = referenceService.allReferencesBuilt();
        $scope.building = referenceService.building();
    };

    // scope functions
    $scope.open = function(node) {
        let recordView = $scope.view.linkedRecordView;
        if (recordView) {
            recordView.scope.record = xelib.GetElementEx(node.handle, '');
        } else {
            $scope.record = xelib.GetElementEx(node.handle, '');
        }
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            viewName: 'referencedByView'
        });
    };

    $scope.onNodeDoubleClick = function(e, node) {
        $scope.open(node);
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    $scope.buildAllReferences = function() {
        referenceService.buildAllReferences();
        getAllReferencesBuilt();
    };

    // event handlers
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

    $scope.$on('builtReferences', () => {
        $scope.reload();
        getAllReferencesBuilt();
    });

    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue === newValue) return;
        if (oldValue) xelib.Release(oldValue);
        if (!newValue) {
            $scope.view.label = 'Referenced By View';
            return;
        }
        $scope.view.label = xelib.Name(newValue);
        $scope.focusedIndex = -1;
        $scope.buildColumns();
        $scope.buildGrid();
        $timeout(() => {
            $scope.resolveElements();
            $scope.gridElement.scrollTop = 0;
        }, 100);
    });

    // initialization
    $timeout($scope.linkToRecordView, 100);
    getAllReferencesBuilt();
});
