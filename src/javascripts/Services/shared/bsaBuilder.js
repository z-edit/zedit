ngapp.service('bsaBuilder', function($rootScope, settingsService, gameService, progressLogger) {
    let archiveExts = { 'FO4': '.ba2' },
        settings,
        archiveExt;

    // PRIVATE API
    let findArchive = function(archives, fileSize) {
        return archives.find(archive => {
            return archive.totalSize + fileSize < settings.maxSize;
        });
    };

    let getArchiveName = function(numArchives, baseName) {
        if (numArchives === 0) return baseName + archiveExt;
        if (settings.createTexturesArchive && numArchives === 1)
            return `${baseName} - Textures${archiveExt}`;
        return `${baseName} - ${numArchives + 1}${archiveExt}`;
    };

    let addArchive = function(archives, baseName) {
        let archive = {
            name: getArchiveName(archives.length, baseName),
            totalSize: 0,
            filePaths: []
        };
        archives.push(archive);
        return archive;
    };

    let addFileToArchive = function(archives, baseName, filePath, folder) {
        let fileSize = fh.getFileSize(filePath),
            archive = findArchive(archives, fileSize) ||
                addArchive(archives, baseName);
        archive.filePaths.push(filePath.slice(folder.length + 1));
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

    let buildArchive = function(archive, folder) {
        let aType = xelib[`ba${gameService.appName}`] || xelib.baFO3,
            fileName = fh.path(folder, archive.name),
            filePaths = archive.filePaths.join('\n');
        progressLogger.log(`Building archive ${archive.name} in ` +
            `${folder}, with ${archive.filePaths.length} files.`);
        xelib.BuildArchive(fileName, folder + '\\', filePaths, aType);
    };

    let deleteFiles = function(archive, folder) {
        archive.filePaths.forEach(filePath => {
            fh.jetpack.remove(fh.path(folder, filePath));
        });
        fh.deleteEmptyFolders(folder);
    };

    let makeArchives = function(baseName, folder, filePaths) {
        let maxArchives = settings.createMultipleArchives ? 999 :
            (settings.createTexturesArchive ? 2 : 1);
        filePaths.reduce((archives, filePath) => {
            addFileToArchive(archives, baseName, filePath, folder);
            return archives;
        }, []).forEach((archive, index) => {
            if (index + 1 > maxArchives)
                return maxArchiveReached(archive);
            if (archive.filePaths.length < settings.minFileCount)
                return notEnoughFiles(archive);
            buildArchive(archive, folder);
            deleteFiles(archive, folder);
        });
    };

    // PUBLIC API
    this.buildArchives = function(baseName, folder) {
        settings = settingsService.settings.archiveCreation;
        makeArchives(baseName, folder, fh.getFiles(folder, {
            matching: settings.fileExprs,
            ignoreCase: true
        }));
    };

    // event handlers
    $rootScope.$on('sessionStarted', () => {
        archiveExt = archiveExts[gameService.appName] || '.bsa';
        settings = settingsService.settings.archiveCreation;
    });
});
