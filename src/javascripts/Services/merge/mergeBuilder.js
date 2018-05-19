ngapp.service('mergeBuilder', function($q, mergeService, recordMergingService, mergeDataService, mergeAssetService, pluginLoadService, progressService) {
    const mastersPath = 'File Header\\Master Files';

    let mergesToBuild = [],
        buildIndex;

    // helpers
    let tryPromise = function(action, onSuccess, onFailure) {
        action.then(function() {
            try {
                onSuccess();
            } catch (x) {
                onFailure(x.stackTrace);
            }
        }, onFailure);
    };

    // INITIALIZATION
    let storePluginHandles = function(merge) {
        merge.plugins.forEach(function(plugin) {
            plugin.handle = xelib.FileByName(plugin.filename);
        });
    };

    let createMergedPlugin = function(merge) {
        merge.plugin = xelib.AddFile(merge.filename);
    };

    let addMastersToMergedPlugin = function(merge) {
        xelib.AddAllMasters(merge.plugin);
    };

    let removePluginMasters = function(merge) {
        let masters = xelib.GetElement(merge.plugin, mastersPath);
        merge.plugins.forEach(function(pluginObj) {
            xelib.RemoveArrayItem(masters, '', 'MAST', pluginObj.filename);
        });
    };

    let prepareMerge = function(merge) {
        let prepared = $q.defer();
        merge.dataPath = mergeService.getMergeDataPath(merge);
        merge.failedToCopy = [];
        tryPromise(pluginLoadService.loadPlugins(merge), () => {
            storePluginHandles(merge);
            mergeDataService.buildMergeData(merge);
            createMergedPlugin(merge);
            addMastersToMergedPlugin(merge);
            prepared.resolve('Merged prepared');
        }, prepared.reject);
        return prepared.promise;
    };

    // FINALIZATION
    let saveMergeFiles = function(merge) {
        fh.jetpack.dir(merge.dataPath);
        let filePath = `${merge.dataPath}\\${merge.filename}`;
        xelib.SaveFile(merge.plugin, filePath);
        // TODO: save form ID map and other log stuff
    };

    let finalizeMerge = function(merge) {
        removePluginMasters(merge);
        saveMergeFiles(merge);
    };

    // builder
    let buildFailed = function(merge, err) {
        progressService.progressError('Building merges failed: \r\n' + err);
        progressService.allowClose();
    };

    let buildMerge = function(merge) {
        let progress = `${merge.name} (${buildIndex}/${mergesToBuild.length})`;
        progressService.progressTitle(`Building merge ${progress}`);
        tryPromise(prepareMerge(merge), () => {
            recordMergingService.mergeRecords(merge);
            mergeAssetService.handleAssets(merge);
            finalizeMerge(merge);
            progressService.addProgress(1);
            buildNextMerge();
        }, err => buildFailed(merge, err));
    };

    let buildNextMerge = function() {
        if (buildIndex >= mergesToBuild.length) {
            progressService.allowClose();
        } else {
            buildMerge(mergesToBuild[buildIndex++]);
        }
    };

    // PUBLIC API
    this.buildMerges = function(merges) {
        mergesToBuild = merges;
        buildIndex = 0;
        progressService.showProgress({
            determinate: true,
            title: 'Building Merges',
            message: 'Initializing...',
            log: [],
            current: 0,
            max: merges.length
        });
        buildNextMerge();
    };
});
