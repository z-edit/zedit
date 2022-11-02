ngapp.run(function(mergeAssetService, assetHelpers, bsaHelpers, bsaBuilder, progressLogger) {
    let {findBsaFiles, findGeneralAssets}  = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let extractAction = function(archive, merge) {
        merge.extracted.push(bsaHelpers.extractArchive(archive));
    };

    let actions = {
        "Copy": function(archive, merge, index, oneArchive) {
            let ext = fh.getFileExt(archive.filePath),
                base = fh.getFileBase(merge.filename),
                suffix = oneArchive ? '' : ` - ${index}`,
                filename = `${base + suffix}.${ext}`,
                newPath = fh.path(merge.dataPath, filename);
            progressLogger.log(`Copying ${archive.filePath} to ${newPath}`, true);
            fh.jetpack.copy(archive.filePath, newPath, { overwrite: true });
        },
        "Extract": extractAction
    };

    let hasBsa = function(archives, bsaPath) {
        return archives.some(archive => {
            return archive.filePath === bsaPath;
        });
    };

    mergeAssetService.addHandler({
        label: 'Bethesda Archive Files',
        priority: -1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                findBsaFiles(plugin, folder).forEach(bsaPath => {
                    if (hasBsa(merge.archives, bsaPath)) return;
                    merge.archives.push({
                        plugin: plugin,
                        filePath: bsaPath,
                        filename: fh.getFileName(bsaPath),
                        assets: bsaHelpers.getFiles(bsaPath)
                    });
                });
            }, { useGameDataFolder: true });
        },
        handle: function(merge) {
            let action = actions[merge.archiveAction];
            if (!merge.archives.length || !action) return;
            progressLogger.log('Handling Bethesda Archive Files');
            let oneArchive = merge.archives.length === 1;
            merge.archives.forEach((a, n) => action(a, merge, n, oneArchive));
        }
    });

    mergeAssetService.addHandler({
        label: 'Extracted Files',
        priority: 100,
        handle: function(merge) {
            if (!merge.extracted.length) return;
            progressLogger.log('Handling Extracted Files');
            merge.extracted.forEach(folder => {
                let folderLen = folder.length;
                findGeneralAssets(folder, merge).forEach(filePath => {
                    let localPath = filePath.slice(folderLen),
                        newPath = fh.path(merge.dataPath, localPath);
                    progressLogger.log(`Copying ${filePath} to ${newPath}`, true);
                    fh.jetpack.dir(fh.getDirectory(newPath));
                    fh.jetpack.copy(filePath, newPath, { overwrite: true });
                });
            });
        }
    });

    mergeAssetService.addHandler({
        label: 'Merged BSA',
        priority: 200,
        handle: function(merge) {
            if (!merge.buildMergedArchive) return;
            progressLogger.log('Building Merged Archives');
            let baseName = fh.getFileBase(merge.filename);
            bsaBuilder.buildArchives(baseName, merge.dataPath);
        }
    })
});
