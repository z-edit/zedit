ngapp.service('mergeDataService', function(mergeAssetService, settingsService, gameService) {
    let service = this,
        dataFolders = {},
        {dataPath} = gameService;

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
        if (!usingModManager()) return pluginsInFolder(dataPath);
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

    this.getPluginDataFolder = function(plugin) {
        return dataFolders[plugin] || dataPath || getDataPath();
    };

    this.updatePluginDataFolder = function(plugin) {
        let {filename} = plugin;
        if (plugin.dataFolder && !dataFolders.hasOwnProperty(filename)) return;
        plugin.dataFolder =  service.getPluginDataFolder(filename);
    };

    this.setPluginDataFolder = function(plugin, dataFolder) {
        dataFolders[plugin] = dataFolder;
    };

    this.cacheDataFolders = function() {
        findPlugins().forEach(filePath => {
            let plugin = fh.getFileName(filePath);
            dataFolders[plugin] = fh.getDirectory(filePath) + '\\';
        });
    };

    this.buildMergeData = function(merge) {
        service.clearMergeData(merge);
        mergeAssetService.getAssets(merge);
        merge.hasData = true;
    };
});
