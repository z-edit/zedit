ngapp.run(function(mergeAssetService, mergeLogger, assetHelpers) {
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
                        plugin, folder,
                        filePath: filePath.slice(sliceLen)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleIniFiles || !merge.iniFiles.length) return;
            mergeLogger.log(`Handling INI Files`);
            if (merge.iniFiles.length === 1)
                return assetHelpers.copyAsset(merge.iniFiles[0], merge);
            let inis = merge.iniFiles.map(asset => {
                mergeLogger.log(`Loading ${asset.filePath}`, true);
                return new Ini(fh.loadTextFile(asset.filePath));
            });
            mergeLogger.log(`Merging ${inis.length} INIs`, true);
            let mergedIni = Ini.merge(...inis),
                filename = fh.getFileBase(merge.filename) + '.ini',
                output = mergedIni.stringify({
                    removeCommentLines: true,
                    blankLineAfterSection: true
                });
            mergeLogger.log(`Saving merged INI ${filename}`, true);
            fh.saveTextFile(`${merge.dataFolder}\\${filename}`, output);
        }
    });
});
