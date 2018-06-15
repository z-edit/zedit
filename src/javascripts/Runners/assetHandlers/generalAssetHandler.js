ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {copyAsset, findGeneralAssets} = assetHelpers;

    let getPluginFolders = function(merge) {
        return merge.plugins.reduce((folders, plugin) => {
            let folder = plugin.dataFolder;
            if (!folders.hasOwnProperty(folder))
                folders[folder] = [];
            folders[folder].push(plugin.filename);
            return folders;
        }, {});
    };

    mergeAssetService.addHandler({
        label: 'General Assets',
        priority: 1,
        get: function(merge) {
            let folders = getPluginFolders(merge),
                dataPath = xelib.GetGlobal('DataPath');

            Object.keys(folders).forEach(folder => {
                if (folder === dataPath) return;
                let folderLen = folder.length,
                    plugins = folders[folder];
                findGeneralAssets(folder, merge).forEach(filePath => {
                    merge.generalAssets.push({
                        filePath: filePath.slice(folderLen),
                        plugins: plugins
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.copyGeneralAssets || !merge.generalAssets.length) return;
            mergeLogger.log(`Handling General Assets`);
            merge.generalAssets.forEach(asset => {
                copyAsset(asset, merge, null, true);
            });
        }
    });
});