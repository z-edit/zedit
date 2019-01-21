ngapp.run(function(mergeAssetService, assetHelpers, mergeIntegrationService, progressLogger, gameService) {
    let {dataPath} = gameService,
        {copyAsset, findGeneralAssets} = assetHelpers,
        {sortModFolders} = mergeIntegrationService;

    let getPluginFolders = function(merge) {
        return merge.plugins.reduce((folders, plugin) => {
            let folder = plugin.dataFolder;
            if (!folders.hasOwnProperty(folder))
                folders[folder] = [];
            folders[folder].push(plugin.filename);
            return folders;
        }, {});
    };

    let getGeneralAssets = function(folder, merge) {
        let folderLen = folder.length;
        return findGeneralAssets(folder, merge)
            .map(path => ({ filePath: path.slice(folderLen) }))
    };

    mergeAssetService.addHandler({
        label: 'General Assets',
        priority: 1,
        get: function(merge) {
            let folders = getPluginFolders(merge),
                modFolders = sortModFolders(Object.keys(folders));

            modFolders.forEach(folder => {
                if (folder === dataPath) return;
                let plugins = folders[folder],
                    assets = getGeneralAssets(folder, merge);
                if (assets.length === 0) return;
                merge.generalAssets.push({ folder, plugins, assets });
            });
        },
        handle: function(merge) {
            if (!merge.copyGeneralAssets || !merge.generalAssets.length) return;
            progressLogger.log(`Handling General Assets`);
            merge.generalAssets.forEach(entry => {
                entry.assets.forEach(asset => {
                    copyAsset({
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge, null, true);
                });
            });
        }
    });
});
