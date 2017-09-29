ngapp.controller('recordTreeViewController', function($scope, $element, $timeout, htmlHelpers, treeService, recordTreeService, recordTreeElementService, recordTreeDragDropService, nodeSelectionService, treeColumnService, hotkeyService, contextMenuService, contextMenuFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper/scope variables
    $scope.overrides = [];
    $scope.contextMenuItems = contextMenuFactory.recordTreeItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordTreeService.buildFunctions($scope);
    recordTreeElementService.buildFunctions($scope);
    recordTreeDragDropService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.record-tree-view', false, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'recordTree');

    // scope functions
    $scope.showContextMenu = function(e) {
        if ($scope.focusedIndex === 0 || !$scope.selectedNodes.length) return;
        contextMenuService.showContextMenu($scope, e);
    };

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

    $scope.onCellMouseDown = function(e, node, index) {
    
        if (e.ctrlKey && index > 0 && node.value_type === xelib.vtReference)
        {
            index -= 1;
            const id = $scope.getRecord(index);
            const path = xelib.LocalPath(node.first_handle);
            const ref = xelib.GetLinksTo(id,path);
            
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

        if (e.srcElement && e.ctrlKey && index > 0 && 
            node.value_type === xelib.vtReference)
        {
            e.srcElement.classList.add('highlight-reference');
        }
        //Helper variables for on controlkeypressed listener
        $scope.highlightedCell = e.srcElement;
        $scope.highlightedNode = node;
    };
    
    $scope.onCellMouseLeave = function(e, node, index) {

        if (e.srcElement && e.srcElement.classList.contains('highlight-reference'))
            e.srcElement.classList.remove('highlight-reference');
        //Helper variables for on controlkeypressed listener
        $scope.highlightedCell = null;
        $scope.highlightedNode = null;
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

    //Event broadcasts from baseHotKey factory
    $scope.$on('controlKeyPressed', function(){
        if ($scope.highlightedCell && $scope.highlightedNode && 
            $scope.highlightedNode.value_type === xelib.vtReference &&
            !$scope.highlightedCell.classList.contains('highlight-reference'))
        {
            $scope.highlightedCell.classList.add('highlight-reference');
        }
    });
    //Event broadcasts from baseHotKey factory
    $scope.$on('controlKeyReleased',function() {
        if ($scope.highlightedCell && 
            $scope.highlightedCell.classList.contains('highlight-reference'))
                $scope.highlightedCell.classList.remove('highlight-reference');
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
