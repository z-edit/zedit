ngapp.service('nodeHelpers', function() {
    let service = this;

    let isNode = function(et) {
        return (node) => { return node.element_type === et }
    };

    let getMapFn = function(nodes, elementType, isGroup) {
        if (nodes[0].element_type === elementType) return xelib.GetElement;
        return xelib[`GetElement${isGroup ? 'Group' : 'File'}`];
    };

    this.isFileNode = isNode(xelib.etFile);
    this.isRecordNode = isNode(xelib.etMainRecord);
    this.isGroupNode = isNode(xelib.etGroupRecord);

    this.isEditableNode = function(node) {
        return xelib.GetIsEditable(node.handle);
    };

    this.getNodeHandles = function(nodes) {
        return nodes.map((node) => { return node.handle });
    };

    this.mapNodeHandles = function(nodes, mapFn) {
        return nodes.map((node) => { return mapFn(node.handle) });
    };

    this.reduceHandles = function(handles, handleKeyFn) {
        handles.reduce(function(obj, handle) {
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
