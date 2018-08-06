ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let findStringFiles = function(plugin, folder) {
        return findGameAssets(plugin, folder, 'strings',
            `${fh.getFileBase(plugin)}*.?(DL|IL)STRINGS`);
    };

    mergeAssetService.addHandler({
        label: 'String Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let sliceLen = folder.length;
                findStringFiles(plugin, folder).forEach(filePath => {
                    merge.stringFiles.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleStringFiles || !merge.stringFiles.length) return;
            mergeLogger.log('Handling String Files');
            merge.stringFiles.forEach(asset => {
                // TODO
            });
        }
    });
});