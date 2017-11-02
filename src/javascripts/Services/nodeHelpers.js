ngapp.service('nodeHelpers', function() {
    let isNode = function(et) {
        return (node) => { return node.element_type === et }
    };

    this.isFileNode = isNode(xelib.etFile);
    this.isRecordNode = isNode(xelib.etMainRecord);
    this.isGroupNode = isNode(xelib.etGroupRecord);

    this.isEditableNode = function(node) {
        return xelib.GetIsEditable(node.handle);
    };
});
