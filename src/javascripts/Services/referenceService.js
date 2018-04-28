ngapp.service('referenceService', function($rootScope, progressService, timerService) {
    const errorMsg = 'There was a critical error when building references for';

    let builtFileNames = [],
        files = [],
        building, currentFile;

    // PRIVATE
    let fileReferencesBuilt = function(file) {
        let timeStr = timerService.getSecondsStr(file.fileName);
        logger.info(`References built for ${file.filename} in ${timeStr}`);
        file.built = true;
        $rootScope.$broadcast('builtReferences', true);
    };

    let checkIfBuilt = function() {
        let loaderStatus = xelib.GetLoaderStatus();
        if (loaderStatus === xelib.lsDone) {
            fileReferencesBuilt(currentFile);
            buildNextFile();
        } else if (loaderStatus === xelib.lsError) {
            logger.error(`${errorMsg} ${currentFile.filename}.`);
            buildNextFile();
        } else {
            setTimeout(checkIfBuilt, 100);
        }
    };

    let referencesBuilt = function() {
        $rootScope.$broadcast('toggleStatusBar', false);
        let timeStr = timerService.getSecondsStr('references');
        logger.info(`References built in ${timeStr}`);
        files.forEach((file) => xelib.Release(file.handle));
        files = [];
        building = false;
    };

    let buildNextFile = function() {
        currentFile = files.find(file => !file.built);
        if (!currentFile) return referencesBuilt();
        $rootScope.$broadcast('statusMessage',
            `Building references for ${currentFile.filename}...`);
        timerService.start(currentFile.filename);
        xelib.BuildReferences(currentFile.handle, false);
        checkIfBuilt();
    };

    let buildFileSync = function(fileHandle) {
        let fileName = xelib.Name(fileHandle);
        progressService.progressMessage(
            `Building references for ${fileName}...`);
        xelib.BuildReferences(fileHandle);
        builtFileNames.push(fileName);
    };

    let buildSync = function(fileHandles) {
        progressService.showProgress({ message: 'Building references...' });
        fileHandles.forEach(buildFileSync);
        progressService.hideProgress();
    };

    let queueBuildFile = function(fileHandle) {
        let fileName = xelib.Name(fileHandle);
        builtFileNames.push(fileName);
        files.push({
            handle: xelib.GetElement(fileHandle),
            filename: fileName,
            built: false
        });
    };

    let buildAsync = function(fileHandles) {
        timerService.start('references');
        $rootScope.$broadcast('toggleStatusBar', true);
        fileHandles.forEach(queueBuildFile);
        if (!building) buildNextFile();
        building = true;
    };

    // PUBLIC
    this.buildReferences = function(fileHandles, sync = false) {
        sync ? buildSync(fileHandles) : buildAsync(fileHandles);
    };

    this.canBuildReferences = function(handle) {
        return !builtFileNames.includes(xelib.Name(handle));
    };
});
