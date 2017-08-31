ngapp.service('columnsService', function(settingsService) {
    let service = this,
        settings = settingsService.settings;

    let formIDColumn = {
        label: "FormID",
        canSort: true,
        getData: function (node, xelib) {
            switch (node.element_type) {
                case xelib.etFile:
                    return xelib.DisplayName(node.handle);
                case xelib.etGroupRecord:
                    let name = xelib.Name(node.handle);
                    if (settings.treeView.showGroupSignatures) {
                        name = `${xelib.Signature(node.handle)} - ` + name;
                    }
                    return name;
                case xelib.etMainRecord:
                    return node.fid == 0 ? 'File Header' : xelib.IntToHex(node.fid);
            }
        }
    };
    let editorIDColumn = {
        label: "EditorID",
        canSort: true,
        getData: function(node, xelib) {
            if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                return xelib.EditorID(node.handle, true);
            }
        }
    };
    let nameColumn = {
        label: "Name",
        canSort: true,
        getData: function(node, xelib) {
            if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                return xelib.FullName(node.handle, true);
            }
        }
    };

    this.buildDataFunction = function(column) {
        try {
            column.getData = new Function('node', 'xelib', column.getDataCode);
        } catch(e) {
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
        fh.saveJsonFile('columns.json', data);
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

    var defaultColumnsConfig = {
        customColumns: [],
        activeColumns: [{
            label: 'FormID',
            width: '40%'
        }, {
            label: 'EditorID',
            width: '25%'
        }, {
            label: 'Name'
        }]
    };

    this.loadColumns = function() {
        let data = fh.loadJsonFile('columns.json', defaultColumnsConfig);
        service.columns = [formIDColumn, editorIDColumn, nameColumn];
        data.customColumns.forEach((column) => service.addColumn(column));
        data.activeColumns.forEach((column) => service.setColumnData(column));
    };

    // load columns immediately upon service initialization
    service.loadColumns();
});