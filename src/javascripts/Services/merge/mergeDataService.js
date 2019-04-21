ngapp.service('mergeDataService', function(mergeAssetService, settingsService, gameService) {
    let service = this,
        dataFolders = {};

    let pluginsInFolder = function(folder) {
        return fh.getFiles(folder, {
            matching: '*.es[plm]',
            recursive: false
        });
    };

    let usingModManager = function() {
        return settingsService.settings.modManager !== 'None';
    };

    let findPlugins = function() {
        if (!usingModManager()) return pluginsInFolder(gameService.dataPath);
        let modsPath = settingsService.settings.modsPath,
            pluginPaths = [];
        fh.getDirectories(modsPath).forEach(dir => {
            pluginPaths.unite(pluginsInFolder(dir));
        });
        return pluginPaths;
    };

    this.clearMergeData = function(merge) {
        return Object.assign(merge, {
            hasData: false,
            archives: [],
            faceData: [],
            voiceData: [],
            billboards: [],
            scriptFragments: [],
            stringFiles: [],
            translations: [],
            iniFiles: [],
            extracted: [],
            generalAssets: []
        });
    };

    this.getPluginDataFolder = function(plugin, mergeFolder) {
        if (!dataFolders[plugin]) return gameService.dataPath;
        let folder = dataFolders.find(folder => folder !== mergeFolder);
        return folder || gameService.dataPath;
    };

    this.updatePluginDataFolder = function(plugin, merge) {
        plugin.dataFolder = service.getPluginDataFolder(
            plugin.filename,
            merge && merge.dataFolder
        );
    };

    this.setPluginDataFolder = function(plugin, dataFolder) {
        dataFolders[plugin] = dataFolder;
    };

    this.cacheDataFolders = function() {
        findPlugins().forEach(filePath => {
            let plugin = fh.getFileName(filePath);
            if (!dataFolders[plugin]) dataFolders[plugin] = [];
            dataFolders[plugin].unshift(fh.getDirectory(filePath));
        });
    };

    this.buildMergeData = function(merge) {
        service.clearMergeData(merge);
        mergeAssetService.getAssets(merge);
        merge.hasData = true;
    };
});
