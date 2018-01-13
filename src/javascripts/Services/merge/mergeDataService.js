ngapp.service('mergeDataService', function($rootScope, assetService, settingsService) {
    let service = this,
        voiceFileExpr = /.*_([0-9a-fA-F]+)_[0-9]\.fuz/,
        plugins = {},
        responsePath = 'Responses\\[0]\\NAM1',
        dataFolders = {},
        dataPath;

    let pluginsInFolder = function(folder) {
        return fh.getFiles(folder, {
            matching: '*.es[plm]',
            recursive: false
        });
    };

    let findPlugins = function() {
        let dataPath = xelib.GetGlobal('DataPath');
        if (!usingModManager()) return pluginsInFolder(dataPath);
        let modsPath = settingsService.settings.modsPath,
            pluginPaths = [];
        fh.getDirectories(modsPath).forEach(function(dir) {
            pluginPaths.unite(pluginsInFolder(dir));
        });
        return pluginPaths;
    };

    let getDataPath = function() {
        dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let usingModManager = function() {
        return settingsService.settings.modManager !== 'None';
    };

    let getFile = function(plugin) {
        if (!plugins.hasOwnProperty(plugin))
            plugins[plugin] = xelib.FileByName(plugin);
        return plugins[plugin];
    };

    let getFaceDataNpc = function(plugin, filePath) {
        let pluginFile = getFile(plugin);
        if (!pluginFile) return '';
        let npcFormId = parseInt(fh.getFileBase(filePath), 16),
            npcRecord = xelib.GetRecord(pluginFile, npcFormId);
        return npcRecord ? xelib.Name(npcRecord) : '';
    };

    let getVoiceDataDialogue = function(plugin, filePath) {
        let pluginFile = getFile(plugin);
        if (!pluginFile) return '';
        let dialogueFormId = parseInt(voiceFileExpr.exec(filePath), 16),
            dialogueRecord = xelib.GetRecord(pluginFile, dialogueFormId);
        if (dialogueRecord && xelib.HasElement(dialogueRecord, responsePath))
            return xelib.GetValue(dialogueRecord, responsePath);
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
                npc: getFaceDataNpc(plugin, filePath)
            });
        });
    };

    let getPluginVoiceData = function(merge, plugin, folder) {
        let sliceLen = folder.length;
        assetService.getVoiceData(plugin, folder).forEach(function(filePath) {
            merge.voiceDataFiles.push({
                plugin: plugin,
                filePath: filePath.slice(sliceLen),
                dialogue: getVoiceDataDialogue(filePath)
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
        return dataFolders[plugin] || dataPath || getDataPath();
    };

    this.cacheDataFolders = function() {
        findPlugins().forEach(function(filePath) {
            let plugin = fh.getFileName(filePath);
            dataFolders[plugin] = fh.getDirectory(filePath) + '\\';
        });
    };

    this.buildMergeData = function(merge) {
        service.clearMergeData(merge);
        let folders = {};
        merge.plugins.forEach(function(pluginObj) {
            let plugin = pluginObj.filename,
                folder = service.getPluginDataFolder(plugin);
            dataSteps.forEach((fn) => fn(merge, plugin, folder));
            folders[folder] = (folders[folder] || []).concat([plugin]);
        });
        getGeneralAssets(merge, folders);
        merge.hasData = true;
    };
});
