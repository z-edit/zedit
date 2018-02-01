ngapp.service('mergeAssetHandler', function(mergeService, mergeDataService) {
    let service = this;

    let detectAssets = function(merge) {
        // TODO: don't get data we already have
        mergeDataService.buildMergeData(merge);
    };

    let fidReplacer = function(merge, plugin) {
        return function(match, fid) {
            let fidKey = fid.toUpperCase();
            if (merge.fidMap[plugin].hasOwnProperty(fidKey))
                return match.replace(fid, merge.fidMap[plugin][fidKey]);
            return match;
        };
    };

    let prepareToCopyAssets = function(merge) {
        merge.dataPath = mergeService.getMergeDataPath(merge);
        merge.dataFolders = merge.plugins.reduce(function(obj, plugin) {
            obj[plugin.filename] = plugin.dataPath;
            return obj;
        }, {});
        merge.fidReplacer = merge.plugins.reduce(function(obj, plugin) {
            obj[plugin.filename] = fidReplacer(merge, plugin.filename);
            return obj;
        }, {});
    };

    // PUBLIC API
    this.assetSteps = [];

    this.getOldPath = function(asset, merge) {
        return merge.dataFolders[asset.plugin] + asset.filePath;
    };

    this.getNewPath = function(asset, merge, expr, skipFn) {
        if (!expr) return `${merge.dataPath}\\${asset.filePath}`;
        let replaceFn = merge.fidReplacer[asset.plugin],
            newPath = asset.filePath.replace(expr, replaceFn);
        if (!skipFn) newPath = newPath.replace(asset.plugin, merge.filename);
        return `${merge.dataPath}\\${newPath}`;
    };

    this.copyAsset = function(asset, merge, expr, skipFn = false) {
        fh.jetpack.copy(
            service.getOldPath(asset, merge),
            service.getNewPath(asset, merge, expr, skipFn)
        );
    };

    this.handleAssets = function(merge) {
        detectAssets(merge);
        prepareToCopyAssets(merge);
        service.assetSteps.forEach((fn) => fn(merge));
    };
});