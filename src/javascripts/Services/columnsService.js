ngapp.service('columnsService', function(columnsFactory, nodeHelpers) {
    let service = this;

    this.buildDataFunction = function(column) {
        try {
            column.getData = new Function('node', 'xelib', column.getDataCode);
        } catch(e) {
            console.log(`Exception building data function for column: ${column.label}:`);
            console.log(e);
            column.getData = function() { return ''; };
        }
    };

    this.addColumn = function(columnConfig, column) {
        column.canSort = columnConfig.customColumnsSortable;
        column.custom = true;
        service.buildDataFunction(column);
        columnConfig.columns.push(column);
    };

    this.activeColumns = function(viewName) {
        return columnsFactory[`${viewName}Columns`].columns.filter(function(column) {
            return column.enabled;
        }).map(function(column) {
            return {
                label: column.label,
                width: column.width
            };
        });
    };

    this.customColumns = function(viewName) {
        return columnsFactory[`${viewName}Columns`].columns.filter(function(column) {
            return column.custom;
        }).map(function(column) {
            return {
                label: column.label,
                getDataCode: column.getDataCode
            };
        });
    };

    this.saveColumns = function(viewName) {
        let data = {
            activeColumns: service.activeColumns(viewName),
            customColumns: service.customColumns(viewName)
        };
        fh.saveJsonFile(`${viewName}Columns.json`, data);
    };

    this.setColumnData = function(columnConfig, columnData) {
        let column = columnConfig.columns.find(function(column) {
            return column.label === columnData.label;
        });
        if (column) {
            column.width = columnData.width;
            column.enabled = true;
        }
    };

    this.loadColumns = function(columnConfig, viewName) {
        let data = fh.loadJsonFile(`${viewName}Columns.json`) || columnConfig.defaultColumnsConfig;
        columnConfig.columns = columnConfig.defaultColumns;
        data.customColumns.forEach((column) => service.addColumn(columnConfig, column));
        data.activeColumns.forEach((column) => service.setColumnData(columnConfig, column));
    };

    this.getColumnsForView = function(viewName) {
        let columnConfig = columnsFactory[`${viewName}Columns`];
        if (!columnConfig.columns) {
            service.loadColumns(columnConfig, viewName);
        }
        return columnConfig.columns;
    }
});
