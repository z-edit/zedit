ngapp.service('columnsService', function(columnsFactory, nodeHelpers) {
    let service = this;

    service.views = {};
    this.buildDataFunction = function(column) {
        try {
            column.getData = new Function('node', 'xelib', column.getDataCode);
        } catch(e) {
            console.log(`Exception building data function for column: ${column.label}:`);
            console.log(e);
            column.getData = function() { return ''; };
        }
    };

    this.addColumn = function(view, column) {
        // TODO: Implement JS Sorting for Tree View custom columns
        column.canSort = (view === 'referencedByView');
        column.custom = true;
        service.buildDataFunction(column);
        service.views[view].columns.push(column);
    };

    this.activeColumns = function(view) {
        return service.views[view].columns.filter(function(column) {
            return column.enabled;
        }).map(function(column) {
            return {
                label: column.label,
                width: column.width
            };
        });
    };

    this.customColumns = function(view) {
        return service.views[view].columns.filter(function(column) {
            return column.custom;
        }).map(function(column) {
            return {
                label: column.label,
                getDataCode: column.getDataCode
            };
        });
    };

    this.saveColumns = function() {
        let data = {}; 
        columnsFactory.views.forEach(view => {
            data[view.viewId] = {
                activeColumns: service.activeColumns(view.viewId),
                customColumns: service.customColumns(view.viewId)
            };
        });
        fh.saveJsonFile('columns.json', data);
    };

    this.setColumnData = function(view, columnData) {
        let column = service.views[view].columns.find(function(column) {
            return column.label === columnData.label;
        });
        if (column) {
            column.width = columnData.width;
            column.enabled = true;
        }
    };

    this.loadColumns = function() {
        let fileData = fh.loadJsonFile('columns.json');
        columnsFactory.views.forEach(view => {
            let data = (!fileData || !fileData[view.viewId]) 
                ? view.defaultColumnsConfig : fileData[view.viewId];
            service.views[view.viewId] = {};
            service.views[view.viewId].columns = view.defaultColumns;
            data.customColumns.forEach((column) => service.addColumn(view.viewId, column));
            data.activeColumns.forEach((column) => service.setColumnData(view.viewId, column));
        });
    };

    this.getColumnsForView = function(view) {
        return service.views[view].columns;
    }

    // load columns immediately upon service initialization
    service.loadColumns();
});
