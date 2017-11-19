ngapp.controller('recordViewController', function($scope, $element, $timeout, htmlHelpers, treeService, recordViewService, recordViewElementService, recordViewDragDropService, nodeSelectionService, treeColumnService, hotkeyService, contextMenuService, contextMenuFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // helper/scope variables
    $scope.overrides = [];
    $scope.contextMenuItems = contextMenuFactory.recordViewItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordViewService.buildFunctions($scope);
    recordViewElementService.buildFunctions($scope);
    recordViewDragDropService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.record-view', false, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'recordView');

    // scope functions
    $scope.showContextMenu = function(e) {
        if ($scope.focusedIndex === 0 || !$scope.selectedNodes.length) return;
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

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.onCellDoubleClick = function(e, node, index) {
        if (index === 0) return;
        if (!node.handles[index - 1]) {
            $scope.addElement(node, index);
            $timeout(() => $scope.editElement(node, index), 50);
        } else {
            $scope.editElement(node, index);
        }
        e.stopImmediatePropagation();
    };

    $scope.onCellMouseDown = function(e, node, index) {
        if (e.ctrlKey && index > 0 && node.value_type === xelib.vtReference) {
            const id = $scope.getRecord(index - 1);
            const path = xelib.LocalPath(node.first_handle);
            const ref = xelib.GetLinksTo(id, path);
            if (ref > 0) {
                $scope.record = ref;
                return;
            }
        }
        let oldIndex = $scope.focusedIndex;
        $scope.focusedIndex = index;
        if (oldIndex !== index) $timeout($scope.updateNodeLabels);
    };

    $scope.onCellMouseOver = function(e, node, index) {
        if (index === 0 || node.value_type !== xelib.vtReference) return;
        $scope.highlightedCell = e.srcElement;
        if (e.srcElement && e.ctrlKey) {
            e.srcElement.classList.add('highlight-reference');
        }
    };

    $scope.onCellMouseLeave = function() {
        if ($scope.highlightedCell) {
            $scope.highlightedCell.classList.remove('highlight-reference');
            delete $scope.highlightedCell;
        }
    };

    $scope.handleEnter = function(e) {
        let node = $scope.lastSelectedNode();
        $scope.onNodeDoubleClick(e, node);
        $scope.onCellDoubleClick(e, node, $scope.focusedIndex);
        e.stopImmediatePropagation();
    };

    $scope.releaseHandles = function(oldValue) {
        xelib.Release(oldValue);
        xelib.ReleaseNodes($scope.virtualNodes);
        $scope.overrides.forEach(xelib.Release);
        $scope.overrides = [];
    };

    // event handling
    $scope.$on('setRecord', function(e, record) {
        $scope.record = record;
        e.stopPropagation();
    });
    $scope.$on('recordUpdated', function(e, record) {
        if ($scope.record === record || $scope.overrides.includes(record)) {
            $scope.updateNodes();
        }
    });
    $scope.$on('nodeUpdated', $scope.reload);
    $scope.$on('reloadGUI', function() {
        if (!$scope.record) return;
        if (!xelib.HasElement($scope.record)) {
            $scope.releaseHandles($scope.record);
            $scope.record = undefined;
        } else {
            $scope.overrides.forEach(xelib.Release);
            $scope.overrides = xelib.GetOverrides($scope.record);
            $scope.buildColumns();
            $scope.reload();
        }
    });
    $scope.$on('nodeAdded', function() {
        if (!$scope.record) return;
        if (!xelib.GetFormID($scope.record)) $scope.reload();
    });


    $scope.$on('controlKeyPressed', function() {
        if (!$scope.highlightedCell) return;
        $scope.highlightedCell.classList.add('highlight-reference');
    });

    $scope.$on('controlKeyReleased', function() {
        if (!$scope.highlightedCell) return;
        $scope.highlightedCell.classList.remove('highlight-reference');
    });

    // initialization
    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue === newValue) return;
        if (oldValue) $scope.releaseHandles(oldValue);
        if (!newValue) {
            $scope.view.label = 'Record View';
            return;
        }
        if (!xelib.IsMaster(newValue)) {
            $scope.record = xelib.GetMasterRecord(newValue);
        } else {
            $scope.view.label = xelib.Name($scope.record);
            $scope.focusedIndex = -1;
            $scope.buildColumns();
            $scope.buildTree();
            $scope.syncWithReferencedByView($scope.record);
            $scope.$broadcast('recordChanged');
            $timeout($scope.resolveElements, 100);
        }
    });

    $scope.showAddressBar = true;
    $scope.autoExpand = true;
    $timeout($scope.linkToTreeView, 100);
    $timeout($scope.linkToReferencedByView, 100);
});
