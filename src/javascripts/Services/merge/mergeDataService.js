ngapp.service('mergeDataService', function(assetService, settingsService) {
    let service = this,
        dataPath;

    let getDataPath = function() {
        dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let usingModManager = function() {
        return settingsService.settings.modManager !== 'None';
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
        assetService.getFaceData(plugin, folder).forEach(function(filePath) {
            merge.faceDataFiles.push({
                plugin: plugin,
                filePath: filePath,
                npc: getFaceDataNpc(filePath)
            });
        });
    };

    let getPluginVoiceData = function(merge, plugin, folder) {
        assetService.getVoiceData(plugin, folder).forEach(function(filePath) {
            merge.voiceDataFiles.push({
                plugin: plugin,
                filePath: filePath,
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
        assetService.getStringFiles(plugin, folder).forEach(function(filePath) {
            merge.stringFiles.push({
                plugin: plugin,
                filePath: filePath
            });
        });
    };

    let getPluginMcmTranslations = function(merge, plugin, folder) {
        assetService.getMcmTranslations(plugin, folder).forEach(function(filePath) {
            merge.translations.push({
                plugin: plugin,
                filePath: filePath
            });
        });
    };

    let getPluginIniFiles = function(merge, plugin, folder) {
        assetService.getIniFiles(plugin, folder).forEach(function(filePath) {
            merge.iniFiles.push({
                plugin: plugin,
                filePath: filePath
            });
        });
    };

    let getGeneralAssets = function(merge, folders) {
        if (!usingModManager()) return;
        Object.keys(folders).forEach(function(folder) {
            let plugins = folders[folder];
            assetService.getGeneralAssets(folder).forEach(function(filePath) {
                merge.generalAssets.push({
                    filePath: filePath,
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
        let pluginPath = fh.jetpack.find(settingsService.settings.modsPath, {
            matching: `*/${plugin}`
        }).last();
        return fh.getDirectory(pluginPath);
    };

    this.buildMergeData = function(merge) {
        clearMergeData(merge);
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
