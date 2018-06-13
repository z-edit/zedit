ngapp.run(function(mergeAssetService, assetHelpers, bsaHelpers) {
    let {findBsaFiles, copyToMerge, findGeneralAssets}  = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let actions = {
        "Copy": function(archive, merge) {
            assetHelpers.copyToMerge(archive.filePath, merge);
        },
        "Extract": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        },
        "Merge": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        }
    };

    mergeAssetService.addHandler({
        label: 'BSA Files',
        priority: -1,
        get: function(merge) {
            let defaultAction = merge.buildArchive ? 'Merge' :
                (merge.extractArchives ? 'Extract' : 'Copy');
            forEachPlugin(merge, (plugin, folder) => {
                findBsaFiles(plugin, folder).forEach(bsaPath => {
                    merge.archives.push({
                        plugin: plugin,
                        filePath: bsaPath,
                        filename: fh.getFileName(bsaPath),
                        fileSize: fh.getFileSize(bsaPath),
                        action: defaultAction
                    });
                });
            });
        },
        handle: function(merge) {
            merge.archives.forEach(archive => {
                let action = actions[archive.action];
                if (action) action(archive, merge);
            });
        }
    });

    mergeAssetService.addHandler({
        label: 'BSA Files (Finalization)',
        priority: 100,
        handle: function(merge) {
            merge.extracted.forEach(folder => {
                let folderLen = folder.length;
                findGeneralAssets(folder, merge).forEach(filePath => {
                    let localPath = filePath.slice(folderLen);
                    copyToMerge(filePath, merge, localPath);
                });
            });
        }
    })
});