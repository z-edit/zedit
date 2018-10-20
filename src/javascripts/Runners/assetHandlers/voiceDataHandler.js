ngapp.run(function(mergeAssetService, assetHelpers, progressLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let voicePath = 'sound\\voice\\',
        responsePath = 'Responses\\[0]\\NAM1',
        voiceFileExpr = /.*_([0-9a-fA-F]+)_[0-9]\.fuz/,
        voiceDataExpr = /_([0-9A-F]{8})_[0-9]\.(fuz|wav)/i;

    let getVoiceDataDialogue = function(pluginFile, filePath) {
        if (!pluginFile) return '';
        try {
            let dialogueFormId = parseInt(voiceFileExpr.exec(filePath), 16),
                dialogueRecord = xelib.GetRecord(pluginFile, dialogueFormId);
            if (dialogueRecord && xelib.HasElement(dialogueRecord, responsePath))
                return xelib.GetValue(dialogueRecord, responsePath);
            return '';
        } catch (x) {
            return '';
        }
    };

    let getVoiceDataAssets = function(plugin, folder, pluginFile) {
        let sliceLen = folder.length;
        return findGameAssets(plugin, folder, voicePath + plugin, `**/*`)
            .map(filePath => ({
                filePath: filePath.slice(sliceLen),
                //dialogue: getVoiceDataDialogue(pluginFile, filePath)
            }));
    };

    mergeAssetService.addHandler({
        label: 'Voice Data Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder, pluginFile) => {
                let assets = getVoiceDataAssets(plugin, folder, pluginFile);
                if (assets.length === 0) return;
                merge.voiceData.push({ plugin, folder, assets });
            }, { useGameDataFolder: true });
        },
        handle: function(merge) {
            if (!merge.handleVoiceData || !merge.voiceData.length) return;
            progressLogger.log('Handling Voice Data Files');
            merge.voiceData.forEach(entry => {
                entry.assets.forEach(asset => {
                    copyAsset({
                        plugin: entry.plugin,
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge, voiceDataExpr);
                });
            });
        }
    });
});