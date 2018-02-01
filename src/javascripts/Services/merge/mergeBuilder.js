ngapp.service('mergeBuilder', function(recordMergingService, mergeDataService) {
    // INITIALIZATION
    let loadPlugins = function(merge) {
        // TODO: Move to its own service?
    };

    let createMergedPlugin = function(merge) {
        merge.plugin = xelib.AddFile(merge.filename);
    };

    let addMastersToMergedPlugin = function(merge) {
        merge.plugins.forEach(function(pluginObj) {
            xelib.AddMaster(merge.plugin, pluginObj.filename);
        });
    };

    let prepareMerge = function(merge) {
        loadPlugins(merge);
        createMergedPlugin(merge);
        addMastersToMergedPlugin(merge);
    };

    // RECORD MERGING
    let mergeRecords = function(merge) {
        if (merge.method === 'refactor') {
            recordMergingService.refactorRecords(merge);
        } else {
            recordMergingService.clampRecords(merge);
        }
    };

    // FINALIZATION
    let cleanMerge = function(merge) {

    };

    let saveMergeFiles = function(merge) {

    };

    let unloadPlugins = function(merge) {

    };

    let finalizeMerge = function(merge) {
        cleanMerge(merge);
        saveMergeFiles(merge);
        unloadPlugins(merge);
    };

    // PUBLIC API
    this.buildMerge = function(merge) {
        prepareMerge(merge);
        mergeRecords(merge);
        handleAssets(merge);
        finalizeMerge(merge);
    };
});