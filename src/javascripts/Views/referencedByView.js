ngapp.controller('referencedByViewController', function($scope, $element, $timeout, htmlHelpers, treeService, referencedByViewService, referencedByViewColumnsService, hotkeyService, nodeSelectionService, treeViewService, treeColumnService, contextMenuService, contextMenuFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    $scope.allColumns = referencedByViewColumnsService.columns;
    $scope.contextMenuItems = contextMenuFactory.referencedByViewItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    treeViewService.buildFunctions($scope, $element);
    referencedByViewService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.referenced-by-view', true);
    nodeSelectionService.buildFunctions($scope, false);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'referencedByView');

    $scope.open = function(node) {
        const record = node.handle ? node.handle : node;
        $scope.record = record;
        $scope.syncWithLinkedViews(record);
    };

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.toggleAddressBar = function(visible) {
        $scope.showAddressBar = visible;
        if (visible) {
            $timeout($scope.focusAddressInput, 50);
        } else if ($scope.treeElement) {
            $scope.treeElement.focus();
        }
    };

    $scope.focusAddressInput = function () {
        let addressInput = htmlHelpers.resolveElement($scope.tabView, 'record-address-bar/input');
        if (addressInput) addressInput.focus();
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            columnsService: referencedByViewColumnsService
        });
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        $scope.open(node);
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode().handle);
        e.stopImmediatePropagation();
    };

    // initialization
    $scope.$on('setRecord', function(e, record) {
        $scope.open(record);
        e.stopPropagation();
    });
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
        if (!newValue) {
            $scope.view.label = 'Referenced By View';
            return;
        }
        if (!xelib.IsMaster(newValue)) {           
            $scope.record = xelib.GetMasterRecord(newValue);
        } else {
            $scope.view.label = xelib.Name(newValue);
            $scope.focusedIndex = -1;
            $scope.buildColumns();
            $scope.buildTree();
            $scope.$broadcast('recordChanged');
            $timeout($scope.resolveElements, 100);
        }
    });

    $scope.showAddressBar = true;
    $scope.sort = { column: 'Record', reverse: false };
    $timeout($scope.linkToTreeView, 100);
});
