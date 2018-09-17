ngapp.service('mergeBuilder', function($q, progressLogger, mergeService, recordMergingService, mergeDataService, mergeAssetService, mergeIntegrationService, seqService, mergeLoadService, referenceService, progressService) {
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

    let releasePluginHandles = function(merge) {
        merge.plugins.forEach(plugin => {
            plugin.handle && xelib.Release(plugin.handle);
        });
    };

    let buildReferences = function(merge) {
        merge.plugins.forEach(plugin => {
            progressLogger.log(`Building references for ${plugin.filename}`);
            xelib.BuildReferences(plugin.handle);
        });
        progressLogger.log('Done building references');
    };

    let prepareMergedPlugin = function(merge) {
        merge.plugin = xelib.AddFile(merge.filename);
        progressLogger.log(`Merging into ${merge.filename}`);
    };

    let addMastersToMergedPlugin = function(merge) {
        xelib.AddAllMasters(merge.plugin);
        progressLogger.log(`Added masters to merged plugin`);
    };

    let addMastersToPlugins = function(merge) {
        merge.plugins.forEach(plugin => {
            xelib.AddMaster(plugin.handle, merge.filename);
        });
        progressLogger.log(`Added ${merge.filename} as a master to the plugins being merged`);
    };

    let removeOldMergeFiles = function(merge) {
        progressService.progressMessage('Deleting old merge files');
        fh.jetpack.remove(merge.dataPath);
        let dataPath = xelib.GetGlobal('DataPath');
        fh.jetpack.remove(dataPath + merge.filename);
    };

    let prepareMerge = function(merge) {
        let prepared = $q.defer();
        merge.dataPath = mergeService.getMergeDataPath(merge);
        merge.failedToCopy = [];
        removeOldMergeFiles(merge);
        progressLogger.init('merge', `${merge.dataPath}\\merge`);
        progressLogger.log(`\r\nBuilding merge ${merge.name}`);
        progressLogger.log(`Merge Folder: ${merge.dataPath}`);
        progressLogger.log(`Merge Method: ${merge.method || 'Clamp'}`);
        tryPromise(mergeLoadService.loadPlugins(merge), () => {
            progressLogger.progress('Building references...', true);
            storePluginHandles(merge);
            buildReferences(merge);
            progressLogger.progress('Preparing merge...', true);
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
        progressLogger.progress('Removing masters from merge...', true);
        let masters = xelib.GetElement(merge.plugin, mastersPath);
        merge.plugins.forEach(plugin => {
            progressLogger.log(`Removing master ${plugin.filename}`);
            xelib.RemoveArrayItem(masters, '', 'MAST', plugin.filename);
        });
    };

    let saveMergeFiles = function(merge) {
        progressLogger.progress('Saving merge files...');
        seqService.buildSeqFile(merge);
        progressLogger.log('Saving merged plugin');
        xelib.SaveFile(merge.plugin, `${merge.dataPath}\\${merge.filename}`);
        merge.dateBuilt = new Date();
        progressLogger.log('Saving additional merge data');
        mergeService.saveMergeData(merge);
    };

    let cleanupMerge = function(merge) {
        mergeAssetService.cleanup(merge);
        releasePluginHandles(merge);
        merge.plugin && xelib.Release(merge.plugin);
    };

    let finalizeMerge = function(merge) {
        mergeIntegrationService.runIntegrations(merge);
        removePluginMasters(merge);
        saveMergeFiles(merge);
        cleanupMerge(merge);
        progressLogger.log(`Completed merge ${merge.name}.`);
        progressLogger.close();
    };

    // builder
    let onMergeError = function(err, merge) {
        cleanupMerge(merge);
        let msg = err ? `${merge.name} failed to build` :
            `${mergesToBuild.length} merges built successfully`;
        progressService.progressTitle(msg);
        progressService.progressMessage(err ? 'Error' : 'All Done!');
        if (err) progressService.progressError(`${msg}:\n${err}`);
        progressService.allowClose();
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
        if (buildIndex >= mergesToBuild.length)
            return progressService.allowClose();
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
