ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let voicePath = 'sound\\voice\\',
        responsePath = 'Responses\\[0]\\NAM1',
        voiceFileExpr = /.*_([0-9a-fA-F]+)_[0-9]\.fuz/,
        voiceDataExpr = /_([0-9A-F]{8})_[0-9]\.(fuz|wav)/i;

    let findVoiceDataFiles = function(plugin, folder) {
        return findGameAssets(plugin, folder, voicePath + plugin, `**/*`);
    };

    let getVoiceDataDialogue = function(pluginFile, filePath) {
        if (!pluginFile) return '';
        let dialogueFormId = parseInt(voiceFileExpr.exec(filePath), 16),
            dialogueRecord = xelib.GetRecord(pluginFile, dialogueFormId);
        if (dialogueRecord && xelib.HasElement(dialogueRecord, responsePath))
            return xelib.GetValue(dialogueRecord, responsePath);
        return '';
    };

    mergeAssetService.addHandler({
        label: 'Voice Data Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder, pluginFile) => {
                let sliceLen = folder.length;
                findVoiceDataFiles(plugin, folder).forEach(filePath => {
                    merge.voiceDataFiles.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen),
                        dialogue: getVoiceDataDialogue(pluginFile, filePath)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleVoiceData || !merge.voiceDataFiles.length) return;
            mergeLogger.log('Handling Voice Data Files');
            merge.voiceDataFiles.forEach(asset => {
                copyAsset(asset, merge, voiceDataExpr);
            });
        }
    });
});