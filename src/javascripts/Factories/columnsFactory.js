ngapp.service('columnsFactory', function(nodeHelpers, settingsService) {
    let settings = settingsService.settings;

    this.columns = [{
        label: 'FormID',
        required: true,
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
    }, {
        label: 'Record',
        getData: function(node, xelib) {
            return xelib.LongName(node.handle);
        }
    }, {
        label: 'Signature',
        getData: function(node, xelib) {
            return xelib.Signature(node.handle);
        }
    }, {
        label: 'File',
        getData: function(node, xelib) {
            let fileName = '';
            xelib.WithHandle(xelib.GetElementFile(node.handle), file => {
                fileName = xelib.DisplayName(file);
            });
            return fileName;
        }
    }];

    this.treeView = [{
        label: 'FormID',
        width: '40%',
        enabled: true
    }, {
        label: 'EditorID',
        width: '25%',
        enabled: true
    }, {
        label: 'Name',
        enabled: true
    }];

    this.referencedByView = [{
        label: 'Record',
        width: '50%',
        enabled: true
    }, {
        label: 'Signature',
        width: '15%',
        enabled: true
    }, {
        label: 'File',
        enabled: true
    }];
});
