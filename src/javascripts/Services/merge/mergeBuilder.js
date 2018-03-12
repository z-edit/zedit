ngapp.service('mergeBuilder', function($q, recordMergingService, mergeAssetHandler, pluginLoadService, progressService) {
    const mastersPath = 'File Header\\Master Files';

    let mergesToBuild = [];

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
        let masters = xelib.GetElements(merge.plugin, mastersPath);
        merge.plugins.forEach(function(pluginObj) {
            xelib.RemoveArrayItem(masters, '', 'MAST', pluginObj.filename);
        });
    };

    let prepareMerge = function(merge) {
        let prepared = $q.defer();
        pluginLoadService.loadPlugins(merge).then(function() {
            storePluginHandles(merge);
            createMergedPlugin(merge);
            addMastersToMergedPlugin(merge);
            prepared.resolve('Merged prepared');
        }, function(err) {
            prepared.reject(err);
        });
        return prepared.promise;
    };

    // FINALIZATION
    let cleanMerge = function(merge) {
        xelib.CleanMasters(merge.plugin);
        if (merge.method !== 'refactor')
            removePluginMasters(merge);
    };

    let saveMergeFiles = function(merge) {
        fh.jetpack.dir(merge.dataPath);
        let filePath = `${merge.dataPath}\\${merge.filename}`;
        xelib.SaveFile(merge.plugin, filePath);
        // TODO: save form ID map and other log stuff
    };

    let finalizeMerge = function(merge) {
        cleanMerge(merge);
        saveMergeFiles(merge);
    };

    // builder
    let buildFailed = function(merge, err) {
        progressService.hideProgress();
        alert('Building merges failed: ' + err);
    };

    let buildMerge = function(merge) {
        prepareMerge(merge).then(function() {
            recordMergingService.mergeRecords(merge);
            mergeAssetHandler.handleAssets(merge);
            finalizeMerge(merge);
            progressService.addProgress(1);
            buildNextMerge();
        }, function(err) {
            buildFailed(merge, err);
        });
    };

    let buildNextMerge = function() {
        if (mergesToBuild.length === 0) return;
        buildMerge(mergesToBuild.shift());
    };

    // PUBLIC API
    this.buildMerges = function(merges) {
        mergesToBuild = merges;
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