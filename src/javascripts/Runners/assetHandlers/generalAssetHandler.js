ngapp.run(function(mergeAssetService, assetHelpers) {
    let {copyAsset, findGeneralAssets} = assetHelpers;

    let buildGeneralAssetRules = function(merge) {
        merge.rules = ['*.@(esp|esm|bsa|ba2|bsl)', 'meta.ini',
            'translations/**/*', 'TES5Edit Backups/**/*', 'fomod/**/*'];
        merge.plugins.forEach(plugin => {
            let basePluginName = fh.getFileBase(plugin.filename);
            merge.rules.push(`**/${basePluginName}.@(seq|ini)`,
                `**/${plugin.filename}/**/*`);
        });
    };

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

            buildGeneralAssetRules(merge);
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
            merge.generalAssets.forEach(asset => {
                copyAsset(asset, merge, null, true);
            });
        }
    });
});