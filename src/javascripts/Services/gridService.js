// Base view to show nodes and columns. It's like a grid view but with no depth.
// Utilized by all views. Functions for specialized views (e.g. gridView/recordView)
// will overwrite most of these base functions.
ngapp.service('gridService', function() {
    this.buildFunctions = function(scope) {
        // scope functions
        scope.reload = function() {
            if (!scope.grid) return;
            let oldGrid = scope.grid;
            scope.clearSelection(true);
            scope.buildGrid();
            scope.releaseGrid(oldGrid);
        };

        scope.onNodeMouseDown = function(e, node) {
            if (e.button !== 2 || !node.selected) scope.selectNode(e, node);
            if (e.button === 2) scope.showContextMenu(e);
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

        scope.buildColumnValues = function(node) {
            node.column_values = scope.columns.map(function(column) {
                try {
                    return column.getData(node, xelib);
                } catch (x) {
                    console.log(x);
                    return '';
                }
            }).trimFalsy();
        };

        scope.getNodeData = function(node) {
            node.has_data = true;
            node.fid = xelib.GetFormID(node.handle);
            scope.buildColumnValues(node);
        };
    }
});
