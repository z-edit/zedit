ngapp.run(function(mergeAssetService, assetHelpers) {
    let {findBsaFiles}  = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let actions = {
        "Copy": function(archive, merge) {
            assetHelpers.copyToMerge(archive.filePath, merge);
        },
        "Extract": function(archive, merge) {
            // TODO: Unimplemented
        },
        "Merge": function(archive, merge) {
            // TODO: Unimplemented
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
});