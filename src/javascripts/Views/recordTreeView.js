ngapp.controller('recordTreeViewController', function($scope, $element, $timeout, htmlHelpers, stylesheetService, treeService, recordTreeService, recordTreeElementService, nodeSelectionService, treeColumnService, errorService, contextMenuService, hotkeyService, hotkeyFactory, contextMenuFactory, formUtils) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper/scope variables
    let hotkeys = hotkeyFactory.recordTreeHotkeys();
    $scope.overrides = [];
    $scope.contextMenuItems = contextMenuFactory.recordTreeItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordTreeService.buildFunctions($scope);
    recordTreeElementService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.record-tree-view', false, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', hotkeys);
    formUtils.buildShowContextMenuFunction($scope);

    // scope functions
    $scope.toggleAddressBar = function(visible) {
        $scope.showAddressBar = visible;
        visible ? $timeout($scope.focusAddressInput, 50) : $scope.treeElement.focus();
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

    $scope.onCellMouseDown = function(index) {
        let oldIndex = $scope.focusedIndex;
        $scope.focusedIndex = index;
        if (oldIndex !== index) $timeout($scope.updateNodeLabels);
    };

    $scope.onDragOver = function() {
        let dragData = $scope.$root.dragData;
        if (dragData && dragData.source === 'mainTreeView') return true;
    };

    $scope.onDrop = function() {
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== 'mainTreeView') return;
        let node = dragData.node,
            path = node.element_type === xelib.etFile ? 'File Header' : '';
        $scope.record = xelib.GetElementEx(node.handle, path);
    };

    $scope.onCellDrag = function(node, index) {
        if (!node.handles[index - 1]) return;
        $scope.$root.dragData = {
            source: 'recordTreeView',
            node: node,
            index: index - 1
        };
        return true;
    };

    $scope.onCellDragOver = function(node, index) {
        if (index === 0) return;
        let dragData = $scope.$root.dragData,
            isReference = node.value_type === xelib.vtReference,
            recordIndex = index - 1;
        if (node.parent && !node.parent.handles[recordIndex] > 0) return;
        if (dragData && dragData.source === 'mainTreeView') {
            return isReference && dragData.node.element_type === xelib.etMainRecord;
        } else if (dragData && dragData.source === 'recordTreeView' ) {
            if (dragData.node.value_type !== node.value_type) return;
            if (node.value_type === xelib.vtEnum || node.value_type === xelib.vtFlags) {
                return node.label === dragData.node.label;
            } else {
                return true;
            }
        }
    };

    $scope.onCellDrop = function(node, index) {
        if (index === 0) return;
        let dragData = $scope.$root.dragData,
            recordIndex = index - 1;
        if (!dragData || dragData.node === node && dragData.index === recordIndex) return;
        let cellHandle = node.handles[recordIndex],
            draggedElement = dragData.node.handle || dragData.node.handles[dragData.index];
        if (!cellHandle) {
            let parentElement = $scope.getParentHandle(node, recordIndex),
                path = $scope.getNewElementPath(node, recordIndex);
            cellHandle = xelib.AddElement(parentElement, path);
        }
        errorService.try(function() {
            xelib.WithHandle(xelib.GetElementFile(cellHandle), function(file) {
                xelib.AddRequiredMasters(draggedElement, file, true);
                xelib.SetElement(cellHandle, draggedElement);
            });
            $scope.reload();
        });
    };

    $scope.handleEnter = function(e) {
        $scope.onNodeDoubleClick(e, $scope.lastSelectedNode());
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
    $scope.$on('reloadGUI', $scope.reload);
    $scope.$on('nodeAdded', function() {
        if (!$scope.record) return;
        if (!xelib.GetFormID($scope.record)) $scope.reload();
    });

    // initialization
    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue === newValue) return;
        if (oldValue) $scope.releaseHandles(oldValue);
        if (!newValue) return;
        if (!xelib.IsMaster(newValue)) {
            $scope.record = xelib.GetMasterRecord(newValue);
        } else {
            $scope.focusedIndex = -1;
            $scope.buildColumns();
            $scope.buildTree();
            $scope.$broadcast('recordChanged');
            $timeout($scope.resolveElements, 100);
        }
    });

    $scope.showAddressBar = true;
    $scope.autoExpand = true;
    $timeout($scope.linkToMainTreeView, 100);
});