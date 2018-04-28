ngapp.service('referenceService', function($rootScope, progressService, timerService) {
    const errorMsg = 'There was a critical error when building references for';

    let service = this,
        builtFileNames = [],
        files = [],
        building, currentFile;

    // PRIVATE
    let fileReferencesBuilt = function(file) {
        let timeStr = timerService.getSecondsStr(file.filename);
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
        if (building) return;
        progressService.showProgress({ message: 'Building references...' });
        fileHandles.forEach(buildFileSync);
        progressService.hideProgress();
    };

    let queueBuildFile = function(fileHandle) {
        let fileName = xelib.Name(fileHandle);
        if (builtFileNames.includes(fileName)) return;
        builtFileNames.push(fileName);
        files.push({
            handle: xelib.GetElement(fileHandle),
            filename: fileName,
            built: false
        });
    };

    let buildAsync = function(fileHandles) {
        if (!building) timerService.start('references');
        $rootScope.$broadcast('toggleStatusBar', true);
        fileHandles.forEach(queueBuildFile);
        if (!building) buildNextFile();
        building = true;
    };

    // PUBLIC
    this.buildReferences = function(fileHandles, sync = false) {
        sync ? buildSync(fileHandles) : buildAsync(fileHandles);
    };

    this.buildAllReferences = function(sync = false) {
        let files = xelib.GetElements().filter(service.canBuildReferences);
        service.buildReferences(files, sync);
    };

    this.allReferencesBuilt = function() {
        if (building) return;
        let notBuilt = xelib.GetLoadedFileNames().subtract(builtFileNames);
        return notBuilt.length === 0;
    };

    this.canBuildReferences = function(handle) {
        return !builtFileNames.includes(xelib.Name(handle));
    };

    this.building = () => building;
});
