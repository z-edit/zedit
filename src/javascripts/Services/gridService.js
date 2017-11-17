// Base view to show nodes and columns. It's like a tree view but with no depth. 
// Utilized by all views. Functions for specialized views (e.g. treeView/recordView)
// will overwrite most of these base functions.
ngapp.service('gridService', function($timeout, htmlHelpers) {
    this.buildFunctions = function(scope, element) {
        // scope functions
        scope.reload = function() {
            if (!scope.tree) return;
            let oldTree = scope.tree;
            scope.clearSelection(true);
            scope.buildTree();
            scope.releaseTree(oldTree);
        };

        scope.resolveNodeError = (path, part) => {
            return new Error(`Failed to resolve node "${part}" in path "${path}"`);
        };

        scope.onNodeMouseDown = function(e, node) {
            if (e.button !== 2 || !node.selected) scope.selectNode(e, node);
            if (e.button === 2) scope.showContextMenu(e);
        };

        scope.resolveElements = function() {
            scope.tabView = element[0];
            scope.treeElement = htmlHelpers.resolveElement(scope.tabView, '.tree-nodes');
            scope.columnsElement = htmlHelpers.resolveElement(scope.tabView, '.column-wrapper');
        };
        
        scope.buildColumns = function() {
            scope.columns = scope.allColumns.filter(function(column) {
                return column.enabled;
            });
            let width = scope.columns.reduce(function(width, c) {
                if (c.width) width += parseInt(c.width.slice(0, -1));
                return width;
            }, 0);
            if (width > 100) {
                let defaultWidth = Math.floor(100 / scope.columns.length) + '%';
                scope.columns.slice(0, -1).forEach(column => {
                    column.width = defaultWidth
                });
            }
            scope.resizeColumns();
        };

        scope.resolveNode = function(path) {
            let node,
                handle = 0;
            path.split('\\').forEach(function(part) {
                let nextHandle = xelib.GetElementEx(handle, `${part}`);
                if (handle > 0) xelib.Release(handle);
                handle = nextHandle;
                if (part !== 'Child Group') {
                    node = scope.getNodeForElement(handle);
                    if (!node) throw scope.resolveNodeError(path, part);
                    if (!node.has_data) scope.getNodeData(node);
                }
            });
            return node;
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
            node.has_data = true;
            node.fid = xelib.GetFormID(node.handle);
            scope.buildColumnValues(node);
        };

        scope.getNodeClass = function(node) {
            node.class = ' ';
        };

        scope.buildNode = function(handle) {
            return {
                handle: handle
            }
        };
    }
});
