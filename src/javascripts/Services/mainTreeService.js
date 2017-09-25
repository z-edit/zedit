ngapp.service('mainTreeService', function($timeout, mainTreeViewFactory, settingsService) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'],
            caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'],
            settings = settingsService.settings;

        // inherited functions
        scope.releaseTree = mainTreeViewFactory.releaseTree;

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

        scope.rebuildNode = function(node) {
            let index = scope.tree.indexOf(node);
            scope.tree.splice(index, 1, {
                handle: node.handle,
                depth: node.depth
            });
        };

        scope.rebuildChildren = function(node) {
            if (!node.expanded) return;
            scope.collapseNode(node);
            scope.expandNode(node);
        };

        scope.resolveNode = function(path) {
            let node = undefined;
            path.split('\\').forEach(function(part) {
                let handle = node ? node.handle : 0;
                handle = xelib.GetElementEx(handle, `${part}`);
                try {
                    if (part !== 'Child Group') {
                        node = scope.getNodeForElement(handle);
                        if (!node) throw scope.resolveNodeError(path, part);
                        if (!node.has_data) scope.getNodeData(node);
                        if (!node.expanded) scope.expandNode(node);
                    }
                } finally {
                    xelib.Release(handle);
                }
            });
            return node;
        };

        scope.navigateToElement = function(handle, open) {
            if (handle === 0) return;
            let node = scope.resolveNode(xelib.LongPath(handle));
            if (node) {
                scope.clearSelection(true);
                scope.selectSingle(node, true, true, false);
                if (open) scope.open(node);
                $timeout(() => scope.scrollToNode(node, true));
            }
        };

        scope.nodeHasHandle = function(node, handle) {
            return node.handle === handle;
        };

        scope.getNewNode = function(node) {
            return scope.getNodeForElement(node.handle);
        };

        scope.setParentsModified = function(handle) {
            let node, element = xelib.GetElementEx(handle);
            while (!node) {
                node = scope.getNodeForElement(element);
                if (!node) {
                    let container = xelib.GetContainer(element);
                    xelib.Release(element);
                    if (!container) return;
                    element = container;
                }
            }
            scope.setNodeModified(node);
            xelib.Release(element);
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

        scope.getCanExpand = function(node) {
            if (node.element_type === xelib.etMainRecord) {
                let childGroup = xelib.GetElement(node.handle, 'Child Group');
                node.can_expand = childGroup && xelib.ElementCount(childGroup) > 0;
            } else {
                let isFile = node.element_type === xelib.etFile,
                    targetCount = +(isFile && !settings.treeView.showFileHeaders);
                node.can_expand = xelib.ElementCount(node.handle) > targetCount;
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
            let path = node.element_type === xelib.etMainRecord ? 'Child Group' : '',
                elements = xelib.GetElements(node.handle, path, true);
            if (node.element_type === xelib.etFile && !settings.treeView.showFileHeaders) {
                elements[scope.sort.reverse ? 'pop' : 'shift']();
            }
            return elements.map((e) => { return scope.buildNode(e, node.depth); });
        };
    };
});
