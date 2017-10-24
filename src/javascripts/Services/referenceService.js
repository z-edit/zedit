ngapp.service('referenceService', function($rootScope) {
    let builtFileNames = [],
        files = [],
        building = false,
        start,
        currentFile;

    // PRIVATE
    let fileReferencesBuilt = function(file) {
        let duration = ((new Date() - start) / 1000).toFixed(1);
        console.log(`References built for ${file.filename} in ${duration}s`);
        file.built = true;
    };

    let checkIfBuilt = function() {
        let loaderStatus = xelib.GetLoaderStatus();
        if (loaderStatus === xelib.lsDone) {
            fileReferencesBuilt(currentFile);
            buildNextFile();
        } else if (loaderStatus === xelib.lsError) {
            alert(`There was a critical error when building references for ${currentFile.filename}.`);
            buildNextFile();
        } else {
            setTimeout(checkIfBuilt, 100);
        }
    };

    let referencesBuilt = function() {
        $rootScope.$broadcast('toggleStatusBar', false);
        files.forEach((file) => xelib.Release(file.handle));
        files = [];
        building = false;
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
        start = new Date();
        xelib.BuildReferences(currentFile.handle, false);
        checkIfBuilt();
    };

    // PUBLIC
    this.buildReferences = function(fileHandles) {
        $rootScope.$broadcast('toggleStatusBar', true);
        fileHandles.forEach(function(handle) {
            let fileName = xelib.Name(handle);
            builtFileNames.push(fileName);
            files.push({
                handle: xelib.GetElement(handle),
                filename: fileName,
                built: false
            });
        });
        if (!building) buildNextFile();
        building = true;
    };

    this.canBuildReferences = function(handle) {
        return !builtFileNames.includes(xelib.Name(handle));
    };
});
