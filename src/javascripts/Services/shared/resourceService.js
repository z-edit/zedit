ngapp.service('resourceService', function() {
    let files = {};

    this.getFiles = function(folder) {
        if (!files.hasOwnProperty(folder))
            files[folder] = xelib.GetContainerFiles('', folder);
        return files[folder];
    };
});