ngapp.service('mainTreeService', function($timeout, mainTreeViewFactory) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'];
        let caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'];

        // helper functions
        let reExpandNode = function(node) {
            let newNode = scope.getNodeForElement(node.handle);
            if (newNode) {
                scope.getNodeData(newNode);
                scope.expandNode(newNode);
            }
        };

        let reSelectNode = function(node, scroll) {
            let newNode = scope.getNodeForElement(node.handle);
            if (newNode) {
                scope.selectSingle(newNode, true, true, false);
                if (scroll) scope.scrollToNode(newNode, true);
            }
        };

        // scope functions
        scope.buildColumns = function() {
            scope.columns = scope.allColumns.filter((column) => { return column.enabled; });
            let width = scope.columns.reduce(function(width, c) {
                if (c.width) width += parseInt(c.width.slice(0, -1));
                return width;
            }, 0);
            if (width > 100) {
                let defaultWidth = Math.floor(100 / scope.columns.length) + '%';
                scope.columns.slice(0, -1).forEach((column) => column.width = defaultWidth);
            }
            scope.resizeColumns();
        };

        scope.buildTree = function() {
            xelib.SetSortMode(scope.sort.column, scope.sort.reverse);
            scope.tree = xelib.GetElements(0, '', true).map(function(handle) {
                return scope.buildNode(handle, -1);
            });
        };

        scope.resolveNode = function(path) {
            let node = undefined;
            path.split('\\').forEach(function(part) {
                let handle = xelib.GetElement(node ? node.handle : 0, `${part}`);
                if (part !== 'Child Group') {
                    node = scope.getNodeForElement(handle);
                    if (!node) throw `Failed to resolve node "${part}" in path "${path}"`;
                    if (!node.has_data) scope.getNodeData(node);
                    if (!node.expanded) scope.expandNode(node);
                }
            });
            return node;
        };

        scope.navigateToElement = function(handle) {
            let node = scope.resolveNode(xelib.LongPath(handle));
            if (node) {
                scope.clearSelection(true);
                scope.selectSingle(node, true, true, false);
                $timeout(function() {
                    scope.scrollToNode(node, true);
                });
            }
        };
        
        scope.getNodeClass = function(node) {
            let classes = [];
            if (xelib.GetIsModified(node.handle)) classes.push('modified');
            if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                if (xelib.IsInjected(node.handle)) classes.push('injected');
                let conflictData = xelib.GetRecordConflictData(node.handle);
                classes.push(caClasses[conflictData[0]]);
                classes.push(ctClasses[conflictData[1]]);
            }
            node.class = classes.join(' ');
        };

        scope.reloadNodes = function() {
            let start = Date.now(),
                oldExpandedNodes = scope.tree.filter((node) => { return node.expanded; }),
                oldSelectedNodes = scope.selectedNodes.slice(),
                oldTree = scope.tree;
            scope.clearSelection(true);
            scope.buildTree();
            oldExpandedNodes.forEach((n) => reExpandNode(n));
            oldSelectedNodes.forEach((n, i, a) => reSelectNode(n, i == a.length - 1));
            mainTreeViewFactory.releaseTree(oldTree);
            console.log(`Rebuilt tree (${scope.tree.length} nodes) in ${Date.now() - start}ms`);
        };

        scope.getCanExpand = function(node) {
            if (node.element_type === xelib.etMainRecord) {
                let childGroup = xelib.GetElement(node.handle, 'Child Group', true);
                node.can_expand = childGroup && xelib.ElementCount(childGroup) > 0;
            } else {
                node.can_expand = xelib.ElementCount(node.handle) > 0;
            }
        };

        scope.buildColumnValues = function(node) {
            node.column_values = scope.columns.map(function(column) {
                try {
                    return column.getData(node, xelib);
                } catch (x) {
                    console.log(x);
                    return { value: '' };
                }
            }).trimFalsy();
        };

        scope.getNodeData = function(node) {
            node.element_type = xelib.ElementType(node.handle);
            node.has_data = true;
            if (node.element_type === xelib.etMainRecord) {
                node.fid = xelib.GetFormID(node.handle);
            }
            scope.getNodeClass(node);
            scope.getCanExpand(node);
            scope.buildColumnValues(node);
        };

        scope.buildNode = function(handle, depth) {
            return {
                handle: handle,
                depth: depth + 1
            }
        };

        scope.buildNodes = function(node) {
            let path = node.element_type === xelib.etMainRecord ? 'Child Group' : '';
            return xelib.GetElements(node.handle, path, true).map(function(handle) {
                return scope.buildNode(handle, node.depth);
            });
        };
    };
});