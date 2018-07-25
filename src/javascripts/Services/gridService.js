ngapp.service('gridService', function(htmlHelpers) {
    this.buildFunctions = function(scope, element) {
        scope.reload = function() {
            if (!scope.grid) return;
            let oldGrid = scope.grid;
            scope.clearSelection(true);
            scope.buildGrid();
            scope.view.releaseGrid(oldGrid);
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
            scope.buildColumnValues(node);
        };

        scope.resolveElements = function() {
            scope.tabView = element[0];
            scope.gridElement = htmlHelpers.resolveElement(scope.tabView, '.nodes');
        };
    }
});
