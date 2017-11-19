ngapp.service('columnsFactory', function(nodeHelpers, settingsService) {
    let settings = settingsService.settings;

    let formIDColumn = {
        label: 'FormID',
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
                return node.fid === 0 ? 'File Header' : xelib.Hex(node.fid);
            }
        }
    };
    let editorIDColumn = {
        label: 'EditorID',
        canSort: true,
        getData: function(node, xelib) {
            if (nodeHelpers.isRecordNode(node) && node.fid > 0) {
                return xelib.EditorID(node.handle, true);
            }
        }
    };
    let nameColumn = {
        label: 'Name',
        canSort: true,
        getData: function(node, xelib) {
            if (nodeHelpers.isRecordNode(node) && node.fid > 0) {
                return xelib.FullName(node.handle) || xelib.PlacementName(node.handle);
            }
        }
    };
    let recordColumn = {
        label: 'Record',
        canSort: true,
        canBeDisabled: true,
        getData: function(node, xelib) {
            return xelib.LongName(node.handle);
        }
    };
    let signatureColumn = {
        label: 'Signature',
        canSort: true,
        canBeDisabled: true,
        getData: function(node, xelib) {
            return xelib.Signature(node.handle);
        }
    }
    let fileColumn = {
        label: 'File',
        canSort: true,
        canBeDisabled: true,
        getData: function(node, xelib) {
            let fileName = '';
            xelib.WithHandle(xelib.GetElementFile(node.handle), file => {
                fileName = xelib.DisplayName(file);
            });
            return fileName;
        }
    };

    this.treeViewColumns = {
        customColumnsSortable: false,
        defaultColumns: [formIDColumn, editorIDColumn, nameColumn],
        defaultColumnsConfig: {
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
        }
    };

    this.referencedByViewColumns = {
        customColumnsSortable: true,
        defaultColumns: [recordColumn, signatureColumn, fileColumn],
        defaultColumnsConfig: {
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
        }
    };
});
