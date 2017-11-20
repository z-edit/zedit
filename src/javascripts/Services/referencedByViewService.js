ngapp.service('referencedByViewService', function(referencedByViewFactory) {
    this.buildFunctions = function(scope) {
        // inherited functions
        scope.releaseGrid = referencedByViewFactory.releaseGrid;

        // scope functions
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
            let colIndex = scope.columns.findIndex(function(column) {
                return column.label === scope.sort.column;
            });
            if (colIndex === -1) return;
            scope.grid.sort(function(a, b) {
                let v1 = a.column_values[colIndex],
                    v2 = b.column_values[colIndex];
                if (!v2 || v1 < v2) return -1;
                if (!v1 || v1 > v2) return 1;
                return 0;
            });
            if (scope.sort.reverse) scope.grid.reverse();
        };

        scope.selectNode = function(e, node) {
            scope.clearSelection();
            scope.selectSingle(node, true, false, false);
        };
    }
});
