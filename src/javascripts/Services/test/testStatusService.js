ngapp.service('testStatusService', function(gameService) {
    let folderPaths = {
        'DataPath': gameService.dataPath,
        'GamePath': gameService.gamePath,
        'appPath': fh.appPath,
        'userPath': fh.userPath
    };

    // private
    let getTestFile = function(testFiles, path) {
        return testFiles && testFiles.findByKey('path', path);
    };

    let filesChanged = function(test) {
        return test.testFiles.reduce((b, testFile) => {
            let oldFile = getTestFile(test.oldTestFiles, testFile.path);
            testFile.added = !oldFile;
            testFile.changed = oldFile && (testFile.hash !== oldFile.hash);
            return b || testFile.changed || testFile.added;
        }, false);
    };

    let filesRemoved = function(test) {
        return test.oldTestFiles.reduce((b, testFile) => {
            return b || !getTestFile(test.testFiles, testFile.path);
        }, false);
    };

    let fileAvailable = function(testFile) {
        let filePath = fh.path(folderPaths[testFile.folder], testFile.path);
        return fh.jetpack.exists(filePath) === 'file';
    };

    let allFilesAvailable = function(test) {
        return test.testFiles.reduce((b, testFile) => {
            testFile.available = fileAvailable(testFile);
            return b && testFile.available;
        }, false);
    };

    let upToDate = function(test) {
        return !filesChanged(test) && !filesRemoved(test);
    };

    let getStatus = function(test) {
        if (test.testFiles.length === 0) return 'No files to test';
        if (!allFilesAvailable(test)) return 'Test files unavailable';
        if (upToDate(test)) return 'Up to date';
        return test.result || 'Ready to be run';
    };

    let getTestFileTitle = function(testFile) {
        if (!testFile.available) return 'Test files unavailable.';
        if (testFile.added) return 'New test files added.';
        if (testFile.changed) return 'Test file changed.';
    };

    let updateTestFileTitles = function(test) {
        test.testFiles.forEach(f => f.title = getTestFileTitle(f));
    };

    // public
    this.updateStatus = function(test) {
        test.status = getStatus(test);
        test.canRun = test.status === 'Ready to be run' || test.result;
        updateTestFileTitles(test);
    };

    this.readyToBeBuilt = function(test) {
        return test.status === 'Ready to be run';
    };
});