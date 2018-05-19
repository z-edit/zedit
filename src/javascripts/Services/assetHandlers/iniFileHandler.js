ngapp.run(function(mergeAssetService) {
    let {forEachPlugin} = mergeAssetService;

    let findIniFiles = function(plugin, folder) {
        return fh.filterExists(folder, [
            `${fh.getFileBase(plugin)}.ini`
        ]);
    };

    mergeAssetService.addHandler({
        label: 'INI Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let sliceLen = folder.length;
                findIniFiles(plugin, folder).forEach(filePath => {
                    merge.iniFiles.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen)
                    });
                });
            });
        },
        handle: function(merge) {
            merge.iniFiles.forEach(asset => {
                // TODO
            });
        }
    });
});