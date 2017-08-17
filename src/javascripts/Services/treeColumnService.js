ngapp.service('treeColumnService', function(stylesheetService) {
    this.buildFunctions = function(scope, treeSelector, columnsEditable, allowOverflow) {
        scope.toggleSort = function(column) {
            if (!column.canSort) return;
            let oldReverse = scope.sort.reverse;
            if (scope.sort.column !== column.label) {
                scope.sort.column = column.label;
                scope.sort.reverse = false;
            } else {
                scope.sort.reverse = !scope.sort.reverse;
            }
            let reverseChanged = oldReverse != scope.sort.reverse;
            scope.reloadNodes(reverseChanged);
        };

        scope.columnResized = function(index, width, skipWidth) {
            scope.columns[index].width = width;
            if (allowOverflow && !skipWidth) scope.updateWidths();
            let selector = `${treeSelector} .column-${index}`,
                property = allowOverflow ? 'min-width' : 'width';
            stylesheetService.setProperty(selector, property, width);
        };

        scope.updateWidths = function() {
            let width = scope.columns.reduce(function(total, column) {
                return total + parseInt(column.width.slice(0, -2));
            }, 0);
            let selector = `${treeSelector} .fix-width`;
            stylesheetService.setProperty(selector, 'min-width', `${width}px`);
        };

        scope.resizeColumns = function() {
            scope.columns.forEach(function(column, index) {
                if (column.width) scope.columnResized(index, column.width, true)
            });
            if (allowOverflow) scope.updateWidths();
        };

        if (columnsEditable) {
            scope.toggleColumnsModal = function(visible) {
                scope.showColumnsModal = visible;
            };
        }
    }
});