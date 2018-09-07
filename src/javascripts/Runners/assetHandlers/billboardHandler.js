ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let billboardPath = `textures\\Terrain\\LODGen\\`,
        billboardExpr = /([0-9A-F]{8})\.(dds|txt)/i;

    let getBillboardFiles = function(plugin, folder) {
        let sliceLen = folder.length;
        return findGameAssets(plugin, folder, billboardPath + plugin, '*')
            .map(filePath => ({ filePath: filePath.slice(sliceLen) }));
    };

    mergeAssetService.addHandler({
        label: 'LOD Billboards',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let assets = getBillboardFiles(plugin, folder);
                if (assets.length === 0) return;
                merge.billboards.push({ plugin, folder, assets });
            });
        },
        handle: function(merge) {
            if (!merge.handleBillboards || !merge.billboards.length) return;
            mergeLogger.log(`Handling LOD Billboards`);
            merge.billboards.forEach(entry => {
                entry.assets.forEach(asset => {
                    copyAsset({
                        plugin: entry.plugin,
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge, billboardExpr);
                });
            });
        }
    });
});