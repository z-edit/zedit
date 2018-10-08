ngapp.run(function(mergeAssetService, assetHelpers, bsaHelpers, progressLogger) {
    let {findBsaFiles, findGeneralAssets}  = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let actions = {
        "Copy": function({filePath}, merge) {
            let newPath = `${merge.dataPath}\\${fh.getFileName(filePath)}`;
            progressLogger.log(`Copying ${filePath} to ${newPath}`, true);
            fh.jetpack.copy(filePath, newPath, { overwrite: true });
        },
        "Extract": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        },
        "Merge": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        }
    };

    mergeAssetService.addHandler({
        label: 'Bethesda Archive Files',
        priority: -1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                findBsaFiles(plugin, folder).forEach(bsaPath => {
                    merge.archives.push({
                        plugin: plugin,
                        filePath: bsaPath,
                        filename: fh.getFileName(bsaPath),
                        fileSize: fh.getFileSize(bsaPath)
                    });
                });
            }, { useGameDataFolder: true });
        },
        handle: function(merge) {
            let action = actions[merge.archiveAction];
            if (!merge.archives.length || !action) return;
            progressLogger.log(`Handling Bethesda Archive Files`);
            merge.archives.forEach(archive => action(archive, merge));
        }
    });

    mergeAssetService.addHandler({
        label: 'Extracted Files',
        priority: 100,
        handle: function(merge) {
            if (merge.action !== 'Extract' || !merge.extracted.length) return;
            progressLogger.log(`Handling Extracted Files`);
            merge.extracted.forEach(folder => {
                let folderLen = folder.length;
                findGeneralAssets(folder, merge).forEach(filePath => {
                    let localPath = filePath.slice(folderLen),
                        newPath = `${merge.dataPath}\\${localPath}`;
                    progressLogger.log(`Moving ${filePath} to ${newPath}`, true);
                    fh.jetpack.move(filePath, newPath, { overwrite: true });
                });
            });
        }
    })
});
