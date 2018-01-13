ngapp.controller('treeViewController', function($scope, $element, $timeout, columnsService, treeService, treeViewService, treeViewElementService, nodeSelectionService, nodeColumnService, hotkeyService, typeToSearchService, contextMenuService, contextMenuFactory, nodeHelpers) {
    // link view to scope
    $scope.view = $scope.$parent.treeView || $scope.$parent.tab;
    $scope.view.scope = $scope;

    // helper variables
    let filterView = $scope.$parent.view;
    let openableTypes = [xelib.etMainRecord, xelib.etFile];
    $scope.allColumns = columnsService.getColumns('treeView');
    $scope.contextMenuItems = contextMenuFactory.treeViewItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    treeViewService.buildFunctions($scope);
    treeViewElementService.buildFunctions($scope);
    typeToSearchService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope, true);
    nodeColumnService.buildFunctions($scope, '.tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'treeView');

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.open = function(node) {
        if (!openableTypes.includes(node.element_type)) return;
        let recordView = (filterView || $scope.view).linkedRecordView;
        if (recordView) {
            // get a new handle for the record to be used with the record view
            let path = nodeHelpers.isFileNode(node) ? 'File Header' : '';
            recordView.scope.record = xelib.GetElementEx(node.handle, path);
        }
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            viewName: 'treeView'
        });
    };

    $scope.openAdvancedSearchModal = function() {
        $scope.$emit('openModal', 'advancedSearch', {
            nodes: $scope.selectedNodes
        });
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
        $scope.open(node);
    };

    $scope.onNodeDrag = function(node) {
        if (nodeHelpers.isGroupNode(node)) return;
        $scope.$root.dragData = {
            source: 'treeView',
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
