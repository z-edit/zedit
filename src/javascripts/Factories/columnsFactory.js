ngapp.service('columnsFactory', function(nodeHelpers, settingsService) {
    let settings = settingsService.settings;

    this.views = [{
        viewId: 'treeView',
        defaultColumns: [{
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
        }, {
            label: 'EditorID',
            canSort: true,
            getData: function(node, xelib) {
                if (nodeHelpers.isRecordNode(node) && node.fid > 0) {
                    return xelib.EditorID(node.handle, true);
                }
            }
        }, {
            label: 'Name',
            canSort: true,
            getData: function(node, xelib) {
                if (nodeHelpers.isRecordNode(node) && node.fid > 0) {
                    return xelib.FullName(node.handle) || xelib.PlacementName(node.handle);
                }
            }
        }],
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
    }, {
        viewId: 'referencedByView',
        defaultColumns: [],
        defaultColumnsConfig: {
            customColumns: [{
                label: 'Record',
                getDataCode: 'return xelib.LongName(node.handle);'
            }, {
                label: 'Signature',
                getDataCode: 'return xelib.Signature(node.handle);'
            }, {
                label: 'File',
                getDataCode: "let fileName = '';\nxelib.WithHandle(xelib.GetElementFile(node.handle), function(file) {\n\tfileName = xelib.DisplayName(file);\n});\nreturn fileName;"
            }],
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
    }]
});
