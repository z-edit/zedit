ngapp.service('mergeBuilder', function(recordMergingService, mergeAssetHandler, pluginLoadService) {
    const mastersPath = 'File Header\\Master Files';

    // INITIALIZATION
    let createMergedPlugin = function(merge) {
        merge.plugin = xelib.AddFile(merge.filename);
    };

    let addMastersToMergedPlugin = function(merge) {
        merge.plugins.forEach(function(pluginObj) {
            xelib.AddMaster(merge.plugin, pluginObj.filename);
        });
    };

    let removePluginMasters = function(merge) {
        let masters = xelib.GetElements(merge.plugin, mastersPath);
        merge.plugins.forEach(function(pluginObj) {
            xelib.RemoveArrayItem(masters, '', 'MAST', pluginObj.filename);
        });
    };

    let prepareMerge = function(merge) {
        pluginLoadService.loadPlugins(merge);
        createMergedPlugin(merge);
        addMastersToMergedPlugin(merge);
    };

    // FINALIZATION
    let cleanMerge = function(merge) {
        if (merge.method === 'refactor') {
            xelib.CleanMasters(merge.plugin);
        } else {
            removePluginMasters(merge);
        }
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
        pluginLoadService.unloadPlugins(merge);
    };

    // PUBLIC API
    this.buildMerge = function(merge) {
        prepareMerge(merge);
        recordMergingService.mergeRecords(merge);
        mergeAssetHandler.handleAssets(merge);
        finalizeMerge(merge);
    };
});