ngapp.run(function(mergeAssetService, assetHelpers) {
    let {copyAsset} = assetHelpers;

    let rules = ['**/*', '!*.@(esp|esm|bsa|ba2|bsl)', '!meta.ini',
        '!translations/**/*', '!TES5Edit Backups/**/*'];

    let findGeneralAssets = function(folder) {
        fh.jetpack.find(folder, {
            matching: '*.@(esp|esm)'
        }).forEach(pluginPath => {
            let plugin = fh.getFileName(pluginPath),
                basePluginName = fh.getFileBase(plugin);
            rules.push(`**/${basePluginName}.@(seq|ini)`,
                `!**/${plugin}/**/*`);
        });
        return fh.jetpack.find(folder, { matching: rules });
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

            Object.keys(folders).forEach(folder => {
                if (folder === dataPath) return;
                let folderLen = folder.length,
                    plugins = folders[folder];
                findGeneralAssets(folder).forEach(filePath => {
                    merge.generalAssets.push({
                        filePath: filePath.slice(folderLen),
                        plugins: plugins
                    });
                });
            });
        },
        handle: function(merge) {
            merge.generalAssets.forEach(function(asset) {
                copyAsset(asset, merge, null, true);
            });
        }
    });
});