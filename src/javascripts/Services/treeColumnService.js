ngapp.service('treeColumnService', function(stylesheetService) {
    this.buildFunctions = function(scope, treeSelector, columnsEditable) {
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

        scope.columnResized = function(index, width) {
            let selector = `${treeSelector} .column-${index}`;
            let rule = stylesheetService.getRule(selector);
            if (!rule) {
                stylesheetService.makeRule(selector, `width: ${width};`);
            } else {
                rule.style["width"] = width;
            }
        };

        scope.resizeColumns = function() {
            scope.columns.forEach(function(column, index) {
                if (column.width) scope.columnResized(index, column.width)
            });
        };

        if (columnsEditable) {
            scope.toggleColumnsModal = function(visible) {
                scope.showColumnsModal = visible;
            };
        }
    }
});