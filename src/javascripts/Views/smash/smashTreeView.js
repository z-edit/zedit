ngapp.controller('smashTreeViewController', function($rootScope, $scope, $element, $timeout, columnsService, treeInterface, treeViewInterface, treeViewElementInterface, nodeSelectionInterface, nodeColumnInterface, layoutService, hotkeyInterface, typeToSearchInterface, contextMenuInterface, nodeHelpers) {
    // link view to scope
    $scope.view = $scope.$parent.treeView || $scope.$parent.tab;
    $scope.view.scope = $scope;

    // verbose logging
    if (verbose) logger.info(`Rendering smashTreeView`);

    // helper variables
    let openableTypes = [xelib.etMainRecord];
    $scope.allColumns = columnsService.getColumns('smashTreeView');

    // inherited functions
    treeInterface($scope, $element);
    treeViewInterface($scope);
    treeViewElementInterface($scope);
    typeToSearchInterface($scope);
    nodeSelectionInterface($scope, true);
    nodeColumnInterface($scope, '.tree-view', true);
    hotkeyInterface($scope, 'onTreeKeyDown', 'treeView');
    contextMenuInterface($scope, 'smashTreeView');

    // scope functions
    $scope.open = function(node, newView) {
        if (!openableTypes.includes(node.element_type)) return;
        let recordView = newView ?
            layoutService.newView('smashRecordView', $scope.view) :
            $scope.view.linkedRecordView;
        if (recordView) $timeout(() => {
            recordView.scope.record = xelib.GetElementEx(node.handle, path);
        });
    };

    $scope.excludeNodes = function() {
        // TODO: do something
    };

    $scope.manageExclusions = function() {
        // TODO: do something
    };

    $scope.regeneratePatch = function() {
        // TODO: do something
    };

    $scope.toggleITPOs = function() {
        // TODO: do something
        $scope.showITPOs = !$scope.showITPOs;
    };

    $scope.openColumnsModal = function() {
        $scope.$emit('openModal', 'editColumns', {
            allColumns: $scope.allColumns,
            viewName: 'treeView'
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
            source: 'smashTreeView',
            node: node
        };
        return true;
    };

    $scope.handleEnter = function(e) {
        $scope.open($scope.lastSelectedNode(), e.ctrlKey);
        e.stopImmediatePropagation();
    };

    $scope.handleDelete = function(e) {
        $scope.excludeNodes();
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
    $scope.$on('rebuildColumns', function() {
        $scope.buildColumns();
        $scope.reload();
    });

    // initialization
    $scope.patchFile = xelib.FileByName($rootScope.patch.filename);
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveElements, 100);
});
