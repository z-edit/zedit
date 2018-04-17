ngapp.service('spreadsheetViewService', function() {
    this.buildFunctions = function(scope) {
        // helper functions
        let getRecords = function() {
            return xelib.GetRecords(0, scope.search);
        };

        // scope functions
        scope.buildColumns = function() {
            scope.columns = scope.allColumns.filterOnKey('enabled');
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

        scope.buildNodes = function() {
            scope.nodes = getRecords().map(scope.buildNode);
        };

        scope.rebuildNode = function(node) {
            let index = scope.tree.indexOf(node);
            scope.tree.splice(index, 1, {
                handle: node.handle,
                depth: node.depth
            });
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
            node.fid = xelib.GetFormID(node.handle);
            scope.buildColumnValues(node);
        };

        scope.buildNodes = function(node) {
            let path = nodeHelpers.isRecordNode(node) ? 'Child Group' : '',
                elements = getElements(node.handle, path);
            return elements.map(e => ({ handle: e }));
        };
    };
});
