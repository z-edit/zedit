var mainTreeViewController = function($scope, $element, $timeout, columnsService, treeService, mainTreeService, nodeSelectionService, treeColumnService) {
    // link view to scope
    let data = $scope.$parent.tab.data;
    data.scope = $scope;

    // inherited variables
    $scope.allColumns = columnsService.columns;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    mainTreeService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope);
    treeColumnService.buildFunctions($scope, '.main-tree-view', true);

    // scope functions
    $scope.buildColumns = function() {
        $scope.columns = $scope.allColumns.filter((column) => { return column.enabled; });
        let width = $scope.columns.reduce(function(width, c) {
            if (c.width) width += parseInt(c.width.slice(0, -1));
            return width;
        }, 0);
        if (width > 100) {
            let defaultWidth = Math.floor(100 / $scope.columns.length) + '%';
            $scope.columns.slice(0, -1).forEach((column) => column.width = defaultWidth);
        }
        $scope.resizeColumns();
    };

    $scope.buildTree = function() {
        xelib.SetSortMode($scope.sort.column, $scope.sort.reverse);
        $scope.tree = xelib.GetElements(0, '', true).map(function(handle) {
            return $scope.buildNode(handle, -1);
        });
    };

    $scope.resolveNode = function(path) {
        let node = undefined;
        path.split('\\').forEach(function(part) {
            let handle = xelib.GetElement(node ? node.handle : 0, `${part}`);
            if (part !== 'Child Group') {
                node = $scope.getNodeForElement(handle);
                if (!node) throw `Failed to resolve node "${part}" in path "${path}"`;
                if (!node.has_data) $scope.getNodeData(node);
                if (!node.expanded) $scope.expandNode(node);
            }
        });
        return node;
    };

    $scope.navigateToElement = function(handle) {
        let node = $scope.resolveNode(xelib.LongPath(handle));
        if (node) {
            $scope.clearSelection(true);
            $scope.selectSingle(node, true, true, false);
            $timeout(function() {
                $scope.scrollToNode(node, true);
            });
        }
    };

    // initialization
    $scope.sort = { column: 'FormID', reverse: false };
    $scope.buildColumns();
    $scope.buildTree();
    $timeout($scope.resolveTreeElement, 100);
};