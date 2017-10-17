ngapp.controller('mainTreeViewController', function($scope, $element, $timeout, columnsService, treeService, mainTreeService, mainTreeElementService, nodeSelectionService, treeColumnService, hotkeyService, contextMenuService, contextMenuFactory) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // helper variables
    let openableTypes = [xelib.etMainRecord, xelib.etFile];
    $scope.allColumns = columnsService.columns;
    $scope.contextMenuItems = contextMenuFactory.mainTreeItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    mainTreeService.buildFunctions($scope);
    mainTreeElementService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope, true);
    treeColumnService.buildFunctions($scope, '.main-tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'mainTree');

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.open = function(node) {
        if (!openableTypes.includes(node.element_type)) return;
        if (data.linkedScope) {
            // get a new handle for the record to be used with the record view
            let path = node.element_type === xelib.etFile ? 'File Header' : '';
            data.linkedScope.record = xelib.GetElementEx(node.handle, path);
        }
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
        $scope.open(node);
    };

    $scope.onNodeDrag = function(node) {
        if (node.element_type === xelib.etGroupRecord) return;
        $scope.$root.dragData = {
            source: 'mainTreeView',
            node: node
        };
        return true;
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode());
        e.stopImmediatePropagation();
    };

    $scope.handleDelete = function(e) {
        $scope.deleteElements();
        e.stopImmediatePropagation();
    };

    $scope.handleV = (e) => $scope.pasteNodes(!e.shiftKey);

    // event handling
    $scope.$on('recordUpdated', (e, element) => {
        let node = $scope.getNodeForElement(element);
        if (node) {
            $scope.rebuildNode(node);
            $scope.setNodeModified(node);
        } else {
            $scope.setParentsModified(element);
        }
    });
    $scope.$on('nodeUpdated', (e, node) => {
        $scope.rebuildNode(node);
        $scope.setNodeModified(node);
    });
    $scope.$on('reloadGUI', $scope.reload);
    $scope.$on('getSelectedNodes', function(e) {
        e.targetScope.selectedNodes = $scope.selectedNodes;
    });

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
});
