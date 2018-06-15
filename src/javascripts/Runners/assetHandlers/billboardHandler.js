ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let billboardPath = `textures\\Terrain\\LODGen\\`,
        billboardExpr = /([0-9A-F]{8})\.(dds|txt)/i;

    let findBillboardFiles = function(plugin, folder) {
        return findGameAssets(plugin, folder, billboardPath + plugin, '*');
    };

    mergeAssetService.addHandler({
        label: 'LOD Billboards',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let sliceLen = folder.length;
                findBillboardFiles(plugin, folder).forEach(filePath => {
                    merge.billboardFiles.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleBillboards || !merge.billboardFiles.length) return;
            mergeLogger.log(`Handling LOD Billboards`);
            merge.billboardFiles.forEach(asset => {
                copyAsset(asset, merge, billboardExpr);
            });
        }
    });
});