ngapp.service('editModalFactory', function() {
    this.renameFile = function(node, scope) {
        return {
            title: 'Rename File',
            editType: 'string',
            maxLength: 64,
            initialValue: xelib.Name(node.handle),
            isValid: (value) => { return value.length > 0; },
            callback: (newValue) => {
                xelib.RenameFile(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        };
    };

    this.changeFileAuthor = function(node, scope) {
        return {
            title: 'Change File Author',
            editType: 'string',
            maxLength: 255,
            initialValue: xelib.GetAuthor(node.handle),
            isValid: () => { return true },
            callback: (newValue) => {
                xelib.SetAuthor(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        };
    };

    this.changeFileDescription = function(node, scope) {
        return {
            title: 'Change File Description',
            editType: 'text',
            maxLength: 255,
            initialValue: xelib.GetDescription(node.handle),
            isValid: () => { return true },
            callback: (newValue) => {
                xelib.SetDescription(node.handle, newValue);
                scope.$root.$broadcast('nodeUpdated', node);
            }
        };
    };

    this.addFile = function(scope) {
        return {
            title: 'Add File',
            editType: 'string',
            maxLength: 64,
            initialValue: 'New File.esp',
            isValid: () => { return true },
            callback: (fileName) => {
                xelib.AddFile(fileName);
                scope.$root.$broadcast('fileAdded');
            }
        };
    };
});