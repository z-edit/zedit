ngapp.run(function(mergeAssetService, assetHelpers, progressLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let faceGeomPath = 'meshes\\actors\\character\\facegendata\\facegeom\\',
        faceTintPath = 'textures\\actors\\character\\facegendata\\facetint\\',
        faceDataExpr = /([0-9A-F]{8})\.(nif|dds)/i;

    let getFaceDataNpc = function(pluginFile, filePath) {
        if (!pluginFile) return '';
        try {
            let loadOrder = xelib.GetFileLoadOrder(pluginFile) * 0x1000000,
                npcFormId = loadOrder + parseInt(fh.getFileBase(filePath), 16),
                npcRecord = xelib.GetRecord(pluginFile, npcFormId);
            return npcRecord ? xelib.Name(npcRecord) : '';
        } catch (x) {
            return '';
        }
    };

    let findFaceDataFiles = function(plugin, folder, pluginFile) {
        let sliceLen = folder.length;
        return Array.prototype.concat(
            findGameAssets(plugin, folder, faceTintPath + plugin, '*'),
            findGameAssets(plugin, folder, faceGeomPath + plugin, '*')
        ).map(filePath => ({
            filePath: filePath.slice(sliceLen),
            //npc: getFaceDataNpc(pluginFile, filePath)
        }));
    };

    mergeAssetService.addHandler({
        label: 'Face Data Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder, pluginFile) => {
                let assets = findFaceDataFiles(plugin, folder, pluginFile);
                if (assets.length === 0) return;
                merge.faceData.push({ plugin, folder, assets });
            });
        },
        handle: function(merge) {
            if (!merge.handleFaceData || !merge.faceData.length) return;
            progressLogger.log(`Handling Face Data Files`);
            merge.faceData.forEach(entry => {
                entry.assets.forEach(asset => {
                    copyAsset({
                        plugin: entry.plugin,
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge, faceDataExpr);
                });
            });
        }
    });
});