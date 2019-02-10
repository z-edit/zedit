ngapp.service('bsaBuilder', function(settingsService, gameService, progressLogger) {
    let settings = settingsService.settings.archiveCreation;

    // PRIVATE API
    let findArchive = function(archives, fileSize) {
        return archives.find(archive => {
            return archive.totalSize + fileSize < settings.maxSize;
        });
    };

    let getArchiveName = function(numArchives, baseName) {
        if (numArchives === 0) return `${baseName}.bsa`;
        if (settings.createTexturesArchive && numArchives === 1)
            return `${baseName} - Textures.bsa`;
        return `${baseName} - ${numArchives + 1}.bsa`;
    };

    let addArchive = function(archives, baseName) {
        archives.push({
            name: getArchiveName(archives.length, baseName),
            totalSize: 0,
            filePaths: []
        });
    };

    let addFileToArchive = function(archives, baseName, filePath) {
        let fileSize = fh.getFileSize(filePath),
            archive = findArchive(archives, fileSize) ||
                addArchive(archives, baseName);
        archive.filePaths.push(filePath);
        archive.totalSize += fileSize;
    };

    let maxArchiveReached = function(archive) {
        progressLogger.log(`Skipping building archive ${archive.name},` +
            `maximum number of allowed archives reached.`);
    };

    let notEnoughFiles = function(archive) {
        progressLogger.log(`Skipping building archive ${archive.name},` +
            `not enough files.`);
    };

    let buildArchive = function(archive) {
        let aType = xelib[`ba${gameService.appName}`] || xelib.baFO3;
        progressLogger.log(`Building archive ${archive.name} in ` +
            `${archive.folder}, with ${archive.filePaths.length} files.`);
        xelib.BuildArchive(archive.name, folder, archive.filePaths, aType);
    };

    let makeArchives = function(baseName, folder, filePaths, compress) {
        let maxArchives = settings.createMultipleArchives ? 999 :
                (settings.createTexturesArchive ? 2 : 1);
        filePaths.reduce((archives, filePath) => {
            addFileToArchive(archives, baseName, filePath, compress);
            return archives;
        }, []).forEach((archive, index) => {
            if (index + 1 > maxArchives)
                return maxArchiveReached(archive);
            if (archive.filePaths.length < settings.minFileCount)
                return notEnoughFiles(archive);
            buildArchive(archive);
        });
    };

    // PUBLIC API
    this.buildArchives = function(baseName, folder) {
        makeArchives(baseName, folder, fh.getFiles(folder, {
            matching: settings.fileExprs,
            ignoreCase: true
        }));
    };
});