var recordTreeViewController = function($scope, $element, $timeout, htmlHelpers, stylesheetService, treeService, recordTreeService, recordTreeElementService, nodeSelectionService, treeColumnService, hotkeyService, hotkeyFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper/scope variables
    let hotkeys = hotkeyFactory.recordTreeHotkeys();
    $scope.overrides = [];

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordTreeService.buildFunctions($scope);
    recordTreeElementService.buildFunctions($scope);
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

    $scope.focusAddressInput = function () {
        let addressInput = htmlHelpers.resolveElement($scope.tabView, 'record-address-bar/input');
        if (addressInput) addressInput.focus();
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.onCellDoubleClick = function(e, node, index) {
        if (!node.handles[index - 1]) {
            $scope.addElement(node, index);
            $timeout(() => $scope.editElement(node, index), 50);
        } else {
            $scope.editElement(node, index);
        }
        e.stopImmediatePropagation();
    };

    $scope.handleEnter = function(e) {
        $scope.onNodeDoubleClick(e, $scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    // event handling
    $scope.$on('setRecord', function(e, record) {
        $scope.record = record;
        e.stopPropagation();
    });

    $scope.$on('nodeUpdated', function(e, node) {
        let recordMatches = function(targetHandle) {
            let handles = [$scope.record].concat($scope.overrides);
            return handles.reduce(function(b, handle) {
                return b || xelib.ElementEquals(handle, targetHandle);
            }, false);
        };
        let h = node.handle;
        if (node.element_type === xelib.etFile) {
            xelib.WithHandle(xelib.GetElement(h, 'File Header'), function(handle) {
                if (recordMatches(handle)) $scope.reload();
            });
        } else {
            if (recordMatches(h)) $scope.reload();
        }
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