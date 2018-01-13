ngapp.service('mergeService', function(settingsService, mergeDataService, objectUtils) {
    let service = this,
        mergeExportKeys = ['name', 'filename', 'extractArchives', 'buildArchive', 'handleFaceData', 'handleVoiceData', 'handleScriptFragments', 'handleStringFiles', 'handleTranslations', 'handleIniFiles', 'copyGeneralAssets'],
        pluginExportKeys = ['filename', 'hash', 'dataFolder'],
        dataPath;

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

    let getDataPath = function() {
        dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let getHash = function(plugin) {
        let filePath = (dataPath || getDataPath()) + plugin.filename;
        return fh.getMd5Hash(filePath);
    };

    let getDataFolder = function(plugin) {
        let path = plugin.dataFolder + plugin.filename;
        if (fh.jetpack.exists(path)) return plugin.dataFolder;
        return mergeDataService.getPluginDataFolder(plugin.filename);
    };

    let importPluginData = function(plugin) {
        return {
            filename: plugin.filename,
            hash: getHash(plugin),
            oldHash: plugin.hash,
            dataFolder: getDataFolder(plugin),
            oldDataFolder: plugin.dataFolder
        }
    };

    let importMergeData = function(merges) {
        return merges.map(function(merge) {
            merge.oldPlugins = merge.plugins;
            merge.plugins = merge.plugins.map(importPluginData)
        });
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
        let merges = fh.loadJsonFile(service.mergeDataPath) || [];
        service.merges = importMergeData(merges);
        service.saveMerges();
    };
});
