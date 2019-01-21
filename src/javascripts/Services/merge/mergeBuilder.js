ngapp.service('mergeBuilder', function($q, progressLogger, mergeService, recordMergingService, mergeDataService, mergeAssetService, mergeIntegrationService, seqService, mergeLoadService, referenceService, progressService, gameService) {
    let {dataPath} = gameService,
        {log, progress} = progressLogger;

    const mastersPath = 'File Header\\Master Files';

    let mergesToBuild = [],
        buildIndex;

    // helpers
    let tryPromise = function(action, onSuccess, onFailure) {
        action.then(function() {
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
        });
    };

    let buildReferences = function(merge) {
        merge.plugins.forEach(plugin => {
            log(`Building references for ${plugin.filename}`);
            xelib.BuildReferences(plugin.handle);
        });
        progressLogger.log('Done building references');
    };

    let prepareMergedPlugin = function(merge) {
        merge.plugin = xelib.AddFile(merge.filename);
        log(`Merging into ${merge.filename}`);
    };

    let addMastersToMergedPlugin = function(merge) {
        xelib.AddAllMasters(merge.plugin);
        log(`Added masters to merged plugin`);
    };

    let addMastersToPlugins = function(merge) {
        merge.plugins.forEach(plugin => {
            xelib.AddMaster(plugin.handle, merge.filename);
        });
        log(`Added ${merge.filename} as a master to the plugins being merged`);
    };

    let removeOldMergeFiles = function(merge) {
        progressService.progressMessage('Deleting old merge files');
        fh.delete(merge.dataPath);
        fh.jetpack.remove(dataPath + merge.filename);
    };

    let prepareMerge = function(merge) {
        let prepared = $q.defer();
        merge.dataPath = mergeService.getMergeDataPath(merge);
        merge.failedToCopy = [];
        removeOldMergeFiles(merge);
        progressLogger.init('merge', `${merge.dataPath}\\merge`);
        log(`\r\nBuilding merge ${merge.name}`);
        log(`Merge Folder: ${merge.dataPath}`);
        log(`Merge Method: ${merge.method || 'Clamp'}`);
        tryPromise(mergeLoadService.loadPlugins(merge), () => {
            progress('Building references...', true);
            storePluginHandles(merge);
            buildReferences(merge);
            progress('Preparing merge...', true);
            mergeDataService.buildMergeData(merge);
            prepareMergedPlugin(merge);
            merge.method === 'Master' ? addMastersToPlugins(merge) :
                addMastersToMergedPlugin(merge);
            prepared.resolve('Merged prepared');
        }, prepared.reject);
        return prepared.promise;
    };

    // FINALIZATION
    let removePluginMasters = function(merge) {
        progress('Removing masters from merge...', true);
        let masters = xelib.GetElement(merge.plugin, mastersPath);
        merge.plugins.forEach(plugin => {
            log(`Removing master ${plugin.filename}`);
            xelib.RemoveArrayItem(masters, '', 'MAST', plugin.filename);
        });
    };

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
        removePluginMasters(merge);
        saveMergeFiles(merge);
        cleanupMerge(merge);
        log(`Completed merge ${merge.name}.`);
        progressLogger.close(false);
    };

    // builder
    let onMergeError = function(err, merge) {
        cleanupMerge(merge);
        progressService.error(`${merge.name} failed to build`, err);
    };

    let onMergeSuccess = function() {
        progressService.success(`${mergesToBuild.length} merges built successfully`);
    };

    let buildMerge = function(merge) {
        let progress = `${merge.name} (${buildIndex}/${mergesToBuild.length})`;
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
                return sum + merge.plugins.length + 6;
            }, 0)
        });
        buildNextMerge();
    };
});
