ngapp.service('editModalFactory', function() {
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
