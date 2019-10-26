ngapp.run(function(mergeAssetService, progressLogger) {
    let getFilePath = function(asset) {
        return `${asset.folder}\\${asset.filePath}`;
    };

    mergeAssetService.addHandler({
        label: 'INI Files',
        priority: 0,
        get: function(merge) {
            mergeAssetService.forEachPlugin(merge, (plugin, folder) => {
                let filename = `${fh.getFileBase(plugin)}.ini`,
                    filePath = folder + filename;
                if (!fh.fileExists(filePath)) return;
                merge.iniFiles.push({
                    plugin, folder,
                    filePath: filename
                });
            }, { useGameDataFolder: true });
        },
        handle: function(merge) {
            if (!merge.handleIniFiles || !merge.iniFiles.length) return;
            progressLogger.log(`Handling INI Files`);
            let filename = fh.getFileBase(merge.filename) + '.ini',
                newPath = `${merge.dataPath}\\${filename}`;
            if (merge.iniFiles.length === 1) {
                let oldPath = getFilePath(merge.iniFiles[0]);
                progressLogger.log(`Copying ${oldPath} to ${newPath}`, true);
                return fh.jetpack.copy(oldPath, newPath);
            }
            let inis = merge.iniFiles.map(asset => {
                let filePath = getFilePath(asset);
                progressLogger.log(`Loading ${filePath}`, true);
                return new Ini(fh.loadTextFile(filePath));
            });
            progressLogger.log(`Merging ${inis.length} INIs`, true);
            let mergedIni = Ini.merge(...inis),
                output = mergedIni.stringify({
                    removeCommentLines: true,
                    blankLineAfterSection: true
                });
            progressLogger.log(`Saving merged INI to ${newPath}`, true);
            fh.saveTextFile(newPath, output);
        }
    });
});
