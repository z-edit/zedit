var mainTreeViewController = function($scope, $element, $timeout, xelibService, stylesheetService, columnsService, mainTreeNodeService, nodeSelectionService) {
    // inherited variables
    $scope.allColumns = columnsService.columns;
    $scope.data = $scope.$parent.tab.data;

    // inherited functions
    mainTreeNodeService.buildNodeFunctions($scope);
    nodeSelectionService.buildSelectionFunctions($scope);

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
        tree = xelib.GetElements(0, '').map(function(handle) {
            return $scope.buildNode(handle, -1);
        });
        $scope.data.tree = tree;
    };

    var getNodeForElement = function(handle) {
        let handles = xelib.GetDuplicateHandles(handle);
        for (let i = 0; i < handles.length; i++) {
            let h = handles[i];
            let newNode = tree.find((node) => { return node.handle == h; });
            if (newNode) return newNode;
        }
    };

    var reExpandNode = function(node) {
        let newNode = getNodeForElement(node.handle);
        if (newNode) {
            $scope.getNodeData(newNode);
            $scope.expandNode(newNode);
        }
    };

    var reSelectNode = function(node, scroll) {
        let newNode = getNodeForElement(node.handle);
        if (newNode) {
            $scope.selectSingle(newNode, true, true, false);
            if (scroll) $scope.scrollToNode(newNode, true);
        }
    };

    var freeHandles = function(nodes1, nodes2) {
        let a = [];
        nodes1.forEach((n) => a.contains(n.handle) || a.push(n.handle));
        nodes2.forEach((n) => a.contains(n.handle) || a.push(n.handle));
        a.forEach((handle) => xelib.Release(handle));
    };

    $scope.reloadNodes = function() {
        let start = Date.now();
        $scope.reloading = true;
        let oldExpandedNodes = [];
        let oldSelectedNodes = $scope.selectedNodes.slice();
        tree.forEach(function(node) {
            if (node.expanded) {
                oldExpandedNodes.push(node);
            } else if (!node.selected) {
                xelib.Release(node.handle);
            }
        });
        $scope.clearSelection(true);
        $scope.buildTree();
        oldExpandedNodes.forEach((n) => reExpandNode(n));
        oldSelectedNodes.forEach((n, i, a) => reSelectNode(n, i == a.length - 1));
        freeHandles(oldExpandedNodes, oldSelectedNodes);
        console.log(`Rebuilt tree (${tree.length} nodes) in ${Date.now() - start}ms`);
    };

    $scope.toggleSort = function(column) {
        if (!column.canSort) return;
        let oldReverse = $scope.sort.reverse;
        if ($scope.sort.column !== column.label) {
            $scope.sort.column = column.label;
            $scope.sort.reverse = false;
        } else {
            $scope.sort.reverse = !$scope.sort.reverse;
        }
        let reverseChanged = oldReverse != $scope.sort.reverse;
        $scope.reloadNodes(reverseChanged);
    };

    $scope.columnResized = function(index, width) {
        let selector = `.main-tree-view .column-${index}`;
        let rule = stylesheetService.getRule(selector);
        if (!rule) {
            stylesheetService.makeRule(selector, `width: ${width};`);
        } else {
            rule.style["width"] = width;
        }
    };

    $scope.resizeColumns = function() {
        $scope.columns.forEach(function(column, index) {
            if (column.width) $scope.columnResized(index, column.width)
        });
    };

    $scope.toggleColumnsModal = function(visible) {
        $scope.showColumnsModal = visible;
    };

    $scope.toggleSearch = function(visible) {
        $scope.showSearch = visible;
        if (!visible) $scope.treeElement.focus();
    };

    $scope.resolveNode = function(path) {
        let node = undefined;
        path.split('\\').forEach(function(part) {
            let handle = xelib.GetElement(node ? node.handle : 0, `${part}`);
            if (part !== 'Child Group') {
                node = getNodeForElement(handle);
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

    $scope.expandNode = function(node) {
        if (!node.children_count) return;
        let start = Date.now();
        node.expanded = true;
        let children = $scope.buildNodes(node);
        let childrenLength = children.length;
        if (childrenLength > 0) {
            node.children_count = childrenLength;
            children.forEach((child) => child.parent = node);
            let insertionIndex = tree.indexOf(node) + 1;
            tree.splice(insertionIndex, 0, ...children);
            console.log(`Built ${childrenLength} nodes in ${Date.now() - start}ms`);
        } else {
            node.children_count = 0;
            node.expanded = false;
        }
    };

    $scope.collapseNode = function(node) {
        if (node.expanded) delete node.expanded;
        let startIndex = tree.indexOf(node) + 1,
            endIndex = startIndex;
        for (; endIndex < tree.length; endIndex++) {
            let child = tree[endIndex];
            if (child.depth <= node.depth) break;
            if (child.selected) $scope.selectSingle(child, false);
        }
        let removedNodes = tree.splice(startIndex, endIndex - startIndex);
        removedNodes.forEach((node) => xelib.Release(node.handle));
        if ($scope.prevNode && $scope.prevNode.parent === node) {
            $scope.prevNode = undefined;
        }
    };

    $scope.toggleNode = function(e, node) {
        if (node.expanded) {
            $scope.collapseNode(node);
        } else {
            $scope.expandNode(node);
        }
        e.stopPropagation();
    };

    $scope.onKeyDown = function(e) {
        if (e.keyCode == 39) {
            $scope.handleRightArrow(e);
        } else if (e.keyCode == 37) {
            $scope.handleLeftArrow(e);
        } else if (e.keyCode == 40) {
            $scope.handleDownArrow(e)
        } else if (e.keyCode == 38) {
            $scope.handleUpArrow(e);
        } else if (e.ctrlKey && !e.shiftKey && e.keyCode == 70) {
            $scope.toggleSearch(true);
        } else {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
    };

    // initialization
    var tree;
    $scope.sort = {
        column: 'FormID',
        reverse: false
    };
    $scope.buildColumns();
    $scope.buildTree();

    $timeout(function() {
        $scope.treeElement = $element[0].nextElementSibling.lastElementChild;
    }, 20);
};