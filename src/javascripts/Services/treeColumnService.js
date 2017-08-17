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

        scope.setFirstSplitBarLeft = function(width) {
            let selector = `${treeSelector} .first-split-bar`,
                left = parseInt(width.slice(0, -2)) - 3;
            stylesheetService.setProperty(selector, 'left', `${left}px`)
        };

        scope.columnResized = function(index, width, skipWidth) {
            scope.columns[index].width = width;
            if (allowOverflow && !index) scope.setFirstSplitBarLeft(width);
            if (allowOverflow && !skipWidth) scope.updateWidths();
            let selector = `${treeSelector} .column-${index}`;
            stylesheetService.setProperty(selector, 'width', width);
            // this hack really shouldn't be necessary, but if it isn't set
            // the column widths don't get applied properly
            if (allowOverflow) {
                stylesheetService.setProperty(selector, 'min-width', width);
            }
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