ngapp.controller('treeViewController', function($scope, $element, $timeout, columnsService, treeService, treeViewService, treeViewElementService, nodeSelectionService, treeColumnService, hotkeyService, contextMenuService, contextMenuFactory, nodeHelpers) {
    // link view to scope
    $scope.view = $scope.$parent.treeView || $scope.$parent.tab;
    $scope.view.scope = $scope;

    // helper variables
    let letterTimeout, queueLetter, letterQueue = '';
    let openableTypes = [xelib.etMainRecord, xelib.etFile];
    $scope.allColumns = columnsService.columns;
    $scope.contextMenuItems = contextMenuFactory.treeViewItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    treeViewService.buildFunctions($scope);
    treeViewElementService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope, true);
    treeColumnService.buildFunctions($scope, '.tree-view', true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'treeView');

    // helper functions
    let getFirstSiblingIndex = function() {
        let startIndex = $scope.tree.indexOf($scope.selectedNodes.last()),
            targetDepth = $scope.tree[startIndex].depth;
        for (let i = startIndex; i >= 1; i--) {
            if ($scope.tree[i - 1].depth < targetDepth) return i;
        }
    };

    let nodeMatches = function(node) {
        if (!node.has_data) $scope.getNodeData(node);
        return node.column_values[0].toLowerCase().startsWith(letterQueue);
    };

    let selectNextNode = function(index) {
        let targetDepth = $scope.tree[index].depth;
        for (let i = index; i < $scope.tree.length; i++) {
            let node = $scope.tree[i];
            if (node.depth > targetDepth) continue;
            if (node.depth < targetDepth) break;
            if (nodeMatches(node)) {
                $scope.clearSelection();
                $scope.selectSingle(node);
                return;
            }
        }
        if (targetDepth > 0) selectNextNode(index - 1);
    };

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.open = function(node) {
        if (!openableTypes.includes(node.element_type)) return;
        let recordView = $scope.view.linkedRecordView;
        if (recordView) {
            // get a new handle for the record to be used with the record view
            let path = nodeHelpers.isFileNode(node) ? 'File Header' : '';
            recordView.scope.record = xelib.GetElementEx(node.handle, path);
        }
        let referencedByView = $scope.view.linkedReferencedByView;
        if (referencedByView) {
            // get a new handle for the record to be used with the record view
            let path = nodeHelpers.isFileNode(node) ? 'File Header' : '';
            referencedByView.scope.record = xelib.GetElementEx(node.handle, path);
        }
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            columnsService: columnsService
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

    $scope.handleLetter = function(e) {
        if (e.keyCode < 65 || e.keyCode > 90) return;
        if (e.shiftKey || e.ctrlKey || e.altKey) return;
        clearTimeout(letterTimeout);
        letterTimeout = setTimeout(() => queueLetter = false, 500);
        if (!queueLetter) letterQueue = '';
        queueLetter = true;
        letterQueue += e.key;
        selectNextNode(getFirstSiblingIndex());
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
