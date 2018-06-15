ngapp.run(function(mergeAssetService, mergeLogger) {
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
            if (!merge.handleIniFiles || !merge.iniFiles.length) return;
            mergeLogger.log(`Handling INI Files`);
            merge.iniFiles.forEach(asset => {
                // TODO
            });
        }
    });
});