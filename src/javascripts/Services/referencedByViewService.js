ngapp.service('referencedByViewService', function($timeout, layoutService, settingsService, xelibService, referencedByViewFactory, objectUtils) {
    this.buildFunctions = function(scope) {
        // inherited functions
        scope.releaseGrid = referencedByViewFactory.releaseGrid;

        scope.buildGrid = function() {
            scope.grid = xelib.GetReferencedBy(scope.record).map(function(handle) {
                let node = {
                    handle: handle
                };
                scope.getNodeData(node);
                return node;
            });
            scope.sortGrid();
        };

        // PUBLIC
        scope.onDragOver = function() {
            let dragData = scope.$root.dragData;
            if (dragData && dragData.source === 'treeView') return true;
        };

        scope.onDrop = function() {
            let dragData = scope.$root.dragData;
            if (!dragData || dragData.source !== 'treeView') return;
            let node = dragData.node;
            scope.open(node);
        };

        scope.toggleSort = function(column) {
            if (!column.canSort) return;
            if (scope.sort.column !== column.label) {
                scope.sort.column = column.label;
                scope.sort.reverse = false;
            } else {
                scope.sort.reverse = !scope.sort.reverse;
            }
            scope.sortGrid();
        };

        scope.sortGrid = function() {
            const colIndex = scope.allColumns.findIndex(column => {
                return column.label === scope.sort.column;
            });
            if (colIndex === -1) return;
            scope.grid.sort((a, b) => {
                return a.column_values[colIndex] > b.column_values[colIndex];
            });
            if (scope.sort.reverse) {
                scope.grid.reverse();
            }
        }

        scope.selectNode = function(e, node) {
            scope.clearSelection();
            scope.selectSingle(node, true, false, false);
        };
    }
});
