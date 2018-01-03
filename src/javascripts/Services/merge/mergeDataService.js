ngapp.service('mergeDataService', function(assetService, settingsService) {
    let service = this,
        dataPath,
        modDirectories;

    let getDataPath = function() {
        dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let getModDirectories = function() {
        modDirectories = fh.getDirectories(settingsService.settings.modsPath);
        return modDirectories;
    };

    let usingModManager = function() {
        return settingsService.settings.modManager !== 'None';
    };

    // TODO
    let getFaceDataNpc = function() {
        return '';
    };

    let getVoiceDataNpc = function() {
        return '';
    };

    let getPluginArchives = function(merge, plugin, folder) {
        let defaultAction = merge.buildArchive ? 'Merge' :
            (merge.extractArchives ? 'Extract' : 'Ignore');
        assetService.getBsaFiles(plugin, folder).forEach(function(bsaPath) {
            merge.archives.push({
                plugin: plugin,
                filePath: bsaPath,
                fileSize: fh.getFileSize(bsaPath),
                action: defaultAction
            });
        });
    };

    let getPluginFaceData = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getFaceData(plugin, folder).forEach(function(filePath) {
            merge.faceDataFiles.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen),
                npc: getFaceDataNpc(filePath)
            });
        });
    };

    let getPluginVoiceData = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getVoiceData(plugin, folder).forEach(function(filePath) {
            merge.voiceDataFiles.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen),
                npc: getVoiceDataNpc(filePath)
            });
        });
    };

    let getPluginScriptFragments = function(merge, plugin, folder) {
        assetService.getScriptFragments(plugin, folder).forEach(function(fragment) {
            merge.scriptFragments.push({
                plugin: plugin,
                filePath: fragment.filename,
                record: fragment.name,
                formId: fragment.formID
            });
        });
    };

    let getPluginStringFiles = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getStringFiles(plugin, folder).forEach(function(filePath) {
            merge.stringFiles.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen)
            });
        });
    };

    let getPluginMcmTranslations = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getMcmTranslations(plugin, folder).forEach(function(filePath) {
            merge.translations.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen)
            });
        });
    };

    let getPluginIniFiles = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getIniFiles(plugin, folder).forEach(function(filePath) {
            merge.iniFiles.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen)
            });
        });
    };

    let getGeneralAssets = function(merge, folders) {
        if (!usingModManager()) return;
        Object.keys(folders).forEach(function(folder) {
            let sliceLen = folder.length,
                plugins = folders[folder];
            assetService.getGeneralAssets(folder).forEach(function(filePath) {
                merge.generalAssets.push({
                    filePath: filePath.slice(sliceLen),
                    plugins: plugins
                });
            });
        });
    };

    let dataSteps = [
        getPluginArchives, getPluginFaceData, getPluginVoiceData,
        getPluginScriptFragments, getPluginStringFiles,
        getPluginMcmTranslations, getPluginIniFiles
    ];

    this.clearMergeData = function(merge) {
        return Object.assign(merge, {
            hasData: false,
            archives: [],
            faceDataFiles: [],
            voiceDataFiles: [],
            scriptFragments: [],
            stringFiles: [],
            translations: [],
            iniFiles: [],
            generalAssets: []
        });
    };

    this.getPluginDataFolder = function(plugin) {
        if (!usingModManager()) return dataPath || getDataPath();
        let directories = modDirectories || getModDirectories(),
            dataFolder = directories.find(function(path) {
                return fh.jetpack.exists(`${path}/${plugin}`);
            });
        if (dataFolder) return dataFolder + '\\';
        return dataPath || getDataPath();
    };

    this.buildMergeData = function(merge) {
        service.clearMergeData(merge);
        let folders = {};
        merge.plugins.forEach(function(plugin) {
            let folder = service.getPluginDataFolder(plugin);
            dataSteps.forEach((fn) => fn(merge, plugin, folder));
            folders[folder] = (folders[folder] || []).concat([plugin]);
        });
        getGeneralAssets(merge, folders);
        merge.hasData = true;
    };
});
