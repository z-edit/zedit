ngapp.service('mergeBuilder', function($q, $rootScope, progressLogger, mergeService, mergeStatusService, recordMergingService, mergeDataService, mergeAssetService, mergeIntegrationService, seqService, mergeLoadService, mergeMasterService, referenceService, progressService, gameService) {
    let {log, progress} = progressLogger;

    const DEFAULT_MERGE_METHOD = 'Clean';

    let mergesToBuild = [],
        buildIndex;

    // helpers
    let tryPromise = function(action, onSuccess, onFailure) {
        action.then(() => {
            try {
                onSuccess();
            } catch (x) {
                onFailure(x.stack);
            }
        }, onFailure);
    };

    // INITIALIZATION
    let storePluginHandles = function(merge) {
        merge.plugins.forEach(plugin => {
            plugin.handle = xelib.FileByName(plugin.filename);
            plugin.loadOrder = xelib.GetFileLoadOrder(plugin.handle)
        });
        merge.plugins.sortOnKey('loadOrder');
    };

    let buildReferences = function(merge) {
        progress('Building references...', true);
        merge.plugins.forEach(plugin => {
            log(`Building references for ${plugin.filename}`);
            xelib.BuildReferences(plugin.handle);
        });
        progressLogger.log('Done building references');
    };

    let getMergeFileName = function(filename) {
        let base = fh.getFileBase(filename),
            ext = fh.getFileExt(filename),
            n = 2;
        while (true) {
            let filePath = fh.path(gameService.dataPath, filename);
            if (!fh.jetpack.exists(filePath)) return filename;
            filename = `${base}_${n++}.${ext}`;
        }
    };

    let isEsm = function(filename) {
        return fh.getFileExt(filename).toLowerCase() === 'esm';
    };

    let prepareMergedPlugin = function(merge) {
        let filename = getMergeFileName(merge.filename);
        merge.plugin = xelib.AddFile(filename);
        log(`Merging into ${filename}`);
        if (isEsm(merge.filename))
            xelib.SetIsESM(merge.plugin, true);
    };

    let removeOldMergeFiles = function(merge) {
        progressService.progressMessage('Deleting old merge files');
        let folderPath = fh.path(merge.dataPath, `merge - ${merge.name}`);
        if (!fh.directoryExists(folderPath))
            throw new Error('The merge destination folder is not empty and does not appear to have been used to build this merge.  Please select a different folder or clear it manually.  ' + merge.dataPath);
        fh.delete(merge.dataPath);
    };

    let prepareMerge = function(merge) {
        let prepared = $q.defer();
        merge.dataPath = mergeService.getMergeDataPath(merge);
        if (!merge.method) merge.method = DEFAULT_MERGE_METHOD;
        merge.failedToCopy = [];
        if (fh.directoryExists(merge.dataPath))
            removeOldMergeFiles(merge);
        let mergeFolderPath = `${merge.dataPath}\\merge - ${merge.name}`;
        progressLogger.init('merge', mergeFolderPath);
        log(`\r\nBuilding merge ${merge.name}`);
        log(`Merge Folder: ${merge.dataPath}`);
        log(`Merge Method: ${merge.method}`);
        tryPromise(mergeLoadService.loadPlugins(merge), () => {
            storePluginHandles(merge);
            if (merge.method === 'Clobber') buildReferences(merge);
            progress('Preparing merge...', true);
            mergeDataService.buildMergeData(merge);
            prepareMergedPlugin(merge);
            mergeMasterService.addMasters(merge);
            prepared.resolve('Merged prepared');
        }, prepared.reject);
        return prepared.promise;
    };

    // FINALIZATION
    let saveMergeFiles = function(merge) {
        progress('Saving merge files...');
        seqService.buildSeqFile(merge);
        log('Saving merged plugin');
        xelib.SaveFile(merge.plugin, `${merge.dataPath}\\${merge.filename}`);
        merge.dateBuilt = new Date();
        log('Saving additional merge data');
        mergeService.saveMergeData(merge);
    };

    let cleanupMerge = function(merge) {
        mergeAssetService.cleanup(merge);
        mergeLoadService.unload(merge);
    };

    let finalizeMerge = function(merge) {
        mergeIntegrationService.runIntegrations(merge);
        mergeMasterService.removeMasters(merge);
        saveMergeFiles(merge);
        if (merge.builtWithErrors)
            throw new Error('Merge built with errors.');
        merge.oldPlugins = angular.copy(merge.plugins);
        mergeStatusService.updateStatus(merge);
        cleanupMerge(merge);
        log(`Completed merge ${merge.name}.`);
        progressLogger.close(false);
    };

    // builder
    let onMergeError = function(err, merge) {
        cleanupMerge(merge);
        progressService.error(`${merge.name} failed to build`, err);
        progressLogger.close(false);
    };

    let onMergeSuccess = function() {
        progressService.success(`${mergesToBuild.length} merges built successfully`);
        $rootScope.$applyAsync();
    };

    let buildMerge = function(merge) {
        let progress = `${merge.name} (${buildIndex}/${mergesToBuild.length})`;
        merge.builtWithErrors = false;
        progressService.progressTitle(`Building merge ${progress}`);
        tryPromise(prepareMerge(merge), () => {
            recordMergingService.mergeRecords(merge);
            mergeAssetService.handleAssets(merge);
            finalizeMerge(merge);
            buildNextMerge();
        }, err => onMergeError(err, merge));
    };

    let buildNextMerge = function() {
        if (buildIndex >= mergesToBuild.length) return onMergeSuccess();
        buildMerge(mergesToBuild[buildIndex++]);
    };

    // PUBLIC API
    this.buildMerges = function(merges) {
        mergesToBuild = merges;
        buildIndex = 0;
        progressService.showProgress({
            determinate: true,
            title: 'Building Merges',
            message: 'Initializing...',
            logName: 'merge',
            current: 0,
            max: merges.reduce((sum, merge) => {
                return sum + merge.plugins.length + 5;
            }, 0)
        });
        buildNextMerge();
    };
});
