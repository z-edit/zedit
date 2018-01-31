ngapp.service('mergeService', function(settingsService, mergeDataService, objectUtils) {
    let service = this,
        mergeExportKeys = ['name', 'filename', 'extractArchives', 'buildArchive', 'handleFaceData', 'handleVoiceData', 'handleScriptFragments', 'handleStringFiles', 'handleTranslations', 'handleIniFiles', 'copyGeneralAssets'],
        pluginExportKeys = ['filename', 'dataFolder'];

    // private functions
    let initMergeData = mergeDataService.clearMergeData;

    let getMergePath = function() {
        let mergePath = settingsService.settings.mergePath;
        fh.jetpack.dir(mergePath);
        return mergePath;
    };

    let getNewMergeName = function() {
        let mergeName = 'New Merge',
            counter = 1,
            mergePath = getMergePath(),
            directories = fh.getDirectories(mergePath).map(fh.getFileName);
        while (directories.includes(mergeName))
            mergeName = `New Merge ${++counter}`;
        return mergeName;
    };

    let exportMergeData = function() {
        return service.merges.map(function(merge) {
            let mergeObj = objectUtils.rebuildObject(merge, mergeExportKeys);
            mergeObj.plugins = merge.plugins.map(function(plugin) {
                return objectUtils.rebuildObject(plugin, pluginExportKeys);
            });
            return mergeObj;
        });
    };

    let getDataFolder = function(plugin) {
        let path = plugin.dataFolder + plugin.filename;
        if (fh.jetpack.exists(path)) return plugin.dataFolder;
        return mergeDataService.getPluginDataFolder(plugin.filename);
    };

    let importPluginData = function(plugin) {
        plugin.dataFolder = getDataFolder(plugin);
        plugin.hash = fh.getMd5Hash(plugin.dataFolder + plugin.filename);
    };

    let importMergeData = function(merge) {
        let path = `${getMergePath()}\\${merge.name}\\merge\\merge.json`,
            oldMerge = fh.loadJsonFile(path);
        merge.oldPlugins = oldMerge && oldMerge.plugins;
        merge.plugins.forEach(importPluginData);
    };

    // public api
    this.newMerge = function() {
        let mergeName = getNewMergeName();
        return initMergeData({
            name: mergeName,
            filename: `${mergeName}.esp`,
            plugins: [],
            status: 'Ready to be built',
            extractArchives: false,
            buildArchive: false,
            handleFaceData: true,
            handleVoiceData: true,
            handleScriptFragments: true,
            handleStringFiles: true,
            handleTranslations: true,
            handleIniFiles: true,
            copyGeneralAssets: false
        });
    };

    this.saveMerges = function() {
        fh.saveJsonFile(service.mergeDataPath, exportMergeData());
    };

    this.loadMerges = function() {
        let profileName = settingsService.currentProfile;
        service.mergeDataPath = `profiles/${profileName}/merges.json`;
        service.merges = fh.loadJsonFile(service.mergeDataPath) || [];
        service.merges.forEach(importMergeData);
        service.saveMerges();
    };

    this.getMergeDataPath = function(merge) {
        return `${getMergePath()}\\${merge.name}`;
    }
});
