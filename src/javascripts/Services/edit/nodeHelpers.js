ngapp.service('nodeHelpers', function() {
    let service = this;

    let getMapFn = function(nodes, elementType, isGroup) {
        if (nodes[0].element_type === elementType) return xelib.GetElement;
        return xelib[`GetElement${isGroup ? 'Group' : 'File'}`];
    };

    this.isFileNode = node => node.element_type === xelib.etFile;
    this.isRecordNode = node => node.element_type === xelib.etMainRecord;
    this.isGroupNode = node => node.element_type === xelib.etGroupRecord;
    this.isRecordHeader = node => node.label === 'Record Header';

    this.isEditableNode = function(node) {
        return xelib.GetIsEditable(node.handle);
    };

    this.getNodeHandles = function(nodes) {
        return nodes.mapOnKey('handle');
    };

    this.mapNodeHandles = function(nodes, mapFn) {
        return nodes.map(node => mapFn(node.handle));
    };

    this.reduceHandles = function(handles, handleKeyFn) {
        return handles.reduce((obj, handle) => {
            let key = handleKeyFn(handle);
            if (obj.hasOwnProperty(key)) {
                xelib.Release(handle);
                return;
            }
            obj[key] = handle;
        }, {});
    };

    this.getUniqueHandles = function(nodes, elementType) {
        let isGroup = elementType === xelib.etGroup,
            mapFn = getMapFn(nodes, elementType, isGroup),
            keyFn = xelib[`${isGroup ? 'Path' : 'Name'}`];
        let handles = service.mapNodeHandles(nodes, mapFn);
        return service.reduceHandles(handles, keyFn);
    };
});
