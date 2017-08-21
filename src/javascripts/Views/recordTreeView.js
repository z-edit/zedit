var recordTreeViewController = function($scope, $element, $timeout, htmlHelpers, stylesheetService, treeService, recordTreeService, nodeSelectionService, treeColumnService, hotkeyService, hotkeyFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper/scope variables
    let hotkeys = hotkeyFactory.recordTreeHotkeys();
    $scope.overrides = [];

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordTreeService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.record-tree-view', false, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', hotkeys);

    // scope functions
    $scope.toggleAddressBar = function(visible) {
        $scope.showAddressBar = visible;
        visible ? $timeout($scope.focusAddressInput, 50) : $scope.treeElement.focus();
    };

    $scope.toggleEditModal = function(visible) {
        $scope.showEditModal = visible;
    };

    $scope.handleEnter = function(e) {
        // TODO
        e.stopPropagation();
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.onCellDoubleClick = function(e, node, index) {
        if (!node.handles[index - 1]) return; // TODO: assign element, and edit if editable
        if (uneditableValueTypes.contains(node.value_type)) return;
        $scope.targetNode = node;
        $scope.targetIndex = index - 1;
        $scope.toggleEditModal(true);
        e.stopImmediatePropagation();
    };

    // event handling
    $scope.$on('setRecord', function(e, record) {
        $scope.record = record;
        e.stopPropagation();
    });

    // initialization
    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue == newValue) return;
        if (oldValue) {
            xelib.Release(oldValue);
            xelib.ReleaseNodes($scope.virtualNodes);
            $scope.overrides.forEach(xelib.Release);
            $scope.overrides = [];
        }
        if (!$scope.record) return;
        if (!xelib.IsMaster($scope.record)) {
            $scope.record = xelib.GetMaster($scope.record);
        } else {
            $scope.buildColumns();
            $scope.buildTree();
            $scope.$broadcast('recordChanged');
            $timeout($scope.resolveElements, 100);
        }
    });

    $scope.showAddressBar = true;
    $scope.autoExpand = true;
    $timeout($scope.linkToMainTreeView, 100);
};