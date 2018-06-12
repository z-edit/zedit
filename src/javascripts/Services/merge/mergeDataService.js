ngapp.service('mergeDataService', function(mergeAssetService, settingsService) {
    let service = this,
        dataFolders = {},
        dataPath;

    let pluginsInFolder = function(folder) {
        return fh.getFiles(folder, {
            matching: '*.es[plm]',
            recursive: false
        });
    };

    let getDataPath = function() {
        dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let usingModManager = function() {
        return settingsService.settings.modManager !== 'None';
    };

    let findPlugins = function() {
        let dataPath = xelib.GetGlobal('DataPath');
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
            faceDataFiles: [],
            voiceDataFiles: [],
            billboardFiles: [],
            scriptFragments: [],
            stringFiles: [],
            translations: [],
            iniFiles: [],
            generalAssets: []
        });
    };

    this.getPluginDataFolder = function(plugin) {
        return dataFolders[plugin] || dataPath || getDataPath();
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
