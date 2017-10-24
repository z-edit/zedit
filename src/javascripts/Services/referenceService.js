ngapp.service('referenceService', function($rootScope) {
    let files, currentFile;

    // PRIVATE
    let checkIfBuilt = function() {
        let loaderStatus = xelib.GetLoaderStatus();
        if (loaderStatus === xelib.lsDone) {
            currentFile.built = true;
            buildNextFile();
        } else if (loaderStatus === xelib.lsError) {
            alert('There was a critical error when building references.');
        } else {
            setTimeout(checkIfBuilt, 250);
        }
    };

    let referencesBuilt = function() {
        $rootScope.$broadcast('toggleStatusBar', false);
        files.forEach((file) => xelib.Release(file.handle));
    };

    let buildNextFile = function() {
        currentFile = files.find(function(file) {
            return !file.built;
        });
        if (!currentFile) {
            referencesBuilt();
            return;
        }
        let message = `Building references for ${currentFile.filename}...`;
        $rootScope.$broadcast('statusMessage', message);
        xelib.BuildReferences(currentFile.handle);
        checkIfBuilt();
    };

    // PUBLIC
    this.buildReferences = function(fileHandles) {
        $rootScope.$broadcast('toggleStatusBar', true);
        files = fileHandles.map(function(handle) {
            return {
                handle: xelib.GetElement(handle),
                filename: xelib.Name(handle),
                built: false
            };
        });
        buildNextFile();
    };
});
