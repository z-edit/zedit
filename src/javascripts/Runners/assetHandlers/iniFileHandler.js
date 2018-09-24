ngapp.run(function(mergeAssetService, progressLogger) {
    mergeAssetService.addHandler({
        label: 'INI Files',
        priority: 0,
        get: function(merge) {
            mergeAssetService.forEachPlugin(merge, (plugin, folder) => {
                let filename = `${fh.getFileBase(plugin)}.ini`,
                    filePath = folder + filename;
                if (fh.jetpack.exists(filePath) !== 'file') return;
                merge.iniFiles.push({
                    plugin, folder,
                    filePath: filename
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleIniFiles || !merge.iniFiles.length) return;
            progressLogger.log(`Handling INI Files`);
            let filename = fh.getFileBase(merge.filename) + '.ini',
                outputPath = `${merge.dataFolder}\\${filename}`;
            if (merge.iniFiles.length === 1)
                return fh.jetpack.copy(merge.iniFiles[0], outputPath);
            let inis = merge.iniFiles.map(asset => {
                progressLogger.log(`Loading ${asset.filePath}`, true);
                return new Ini(fh.loadTextFile(asset.filePath));
            });
            progressLogger.log(`Merging ${inis.length} INIs`, true);
            let mergedIni = Ini.merge(...inis),
                output = mergedIni.stringify({
                    removeCommentLines: true,
                    blankLineAfterSection: true
                });
            progressLogger.log(`Saving merged INI ${filename}`, true);
            fh.saveTextFile(outputPath, output);
        }
    });
});
