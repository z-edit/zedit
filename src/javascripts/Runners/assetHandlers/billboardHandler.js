ngapp.run(function(mergeAssetService, assetHelpers) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let billboardPath = `textures\\Terrain\\LODGen\\`;

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
            merge.billboardFiles.forEach(asset => {
                copyAsset(asset, merge);
            });
        }
    });
});