ngapp.service('editModalFactory', function(gameService) {
    this.saveFileAs = function(node, scope) {
        let name = xelib.Name(node.handle);
        scope.$emit('openModal', 'edit', {
            title: 'Save File As',
            class: 'edit-modal save-file-as-modal',
            editType: 'string',
            maxLength: 64,
            initialValue: fh.path(gameService.dataPath, name),
            isValid: (value) => { return value.length > 0 },
            callback: (filePath) => {
                xelib.SaveFile(node.handle, filePath);
            }
        });
    };

    this.addFile = function(scope, callback) {
        scope.$emit('openModal', 'edit', {
            title: 'Add File',
            editType: 'string',
            maxLength: 64,
            initialValue: 'New File.esp',
            isValid: (value) => { return !xelib.HasElement(0, value) },
            callback: callback || ((fileName) => {
                xelib.Release(xelib.AddFile(fileName));
                scope.$root.$broadcast('reloadGUI');
            })
        });
    };
});
