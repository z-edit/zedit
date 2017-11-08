ngapp.service('referencedByViewColumnsService', function(settingsService) {
    let service = this,
        settings = settingsService.settings;

    let longNameColumn = {
        label: 'Record',
        canSort: true,
        getData: function(node, xelib) {
            if (node.element_type === xelib.etMainRecord) {
                return xelib.LongName(node.handle);
            }
        }
    };
    let signatureColumn = {
        label: 'Signature',
        canSort: true,
        getData: function(node, xelib) {
            if (node.element_type === xelib.etMainRecord) {
                return xelib.Signature(node.handle);
            }
        }
    };
    let fileColumn = {
        label: 'File',
        canSort: true,
        getData: function(node, xelib) {
            let fileName = '';
            xelib.WithHandle(xelib.GetElementFile(node.handle), function(file) {
                fileName = xelib.DisplayName(file);
            });
            return fileName;
        }
    };

    this.buildDataFunction = function(column) {
        try {
            column.getData = new Function('node', 'xelib', column.getDataCode);
        } catch (e) {
            console.log(`Exception building data function for column: ${column.label}:`);
            console.log(e);
            column.getData = function() { return ''; };
        }
    };

    this.addColumn = function(column) {
        column.canSort = false;
        column.custom = true;
        service.buildDataFunction(column);
        service.columns.push(column);
    };

    this.activeColumns = function() {
        return service.columns.filter(function(column) {
            return column.enabled;
        }).map(function(column) {
            return {
                label: column.label,
                width: column.width
            };
        });
    };

    this.customColumns = function() {
        return service.columns.filter(function(column) {
            return column.custom;
        }).map(function(column) {
            return {
                label: column.label,
                getDataCode: column.getDataCode
            };
        });
    };

    this.saveColumns = function() {
        let data = {
            activeColumns: service.activeColumns(),
            customColumns: service.customColumns()
        };
        fh.saveJsonFile('referencesColumns.json', data);
    };

    this.setColumnData = function(columnData) {
        let column = service.columns.find(function(column) {
            return column.label === columnData.label;
        });
        if (column) {
            column.width = columnData.width;
            column.enabled = true;
        }
    };

    let defaultColumnsConfig = {
        customColumns: [],
        activeColumns: [{
            label: 'Record',
            width: '50%'
        }, {
            label: 'Signature',
            width: '15%'
        }, {
            label: 'File'
        }]
    };

    this.loadColumns = function() {
        let data = fh.loadJsonFile('referencesColumns.json') || defaultColumnsConfig;
        service.columns = [longNameColumn, signatureColumn, fileColumn];
        data.customColumns.forEach((column) => service.addColumn(column));
        data.activeColumns.forEach((column) => service.setColumnData(column));
    };

    // load columns immediately upon service initialization
    service.loadColumns();
});
