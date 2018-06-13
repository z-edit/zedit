ngapp.service('assetHelpers', function(bsaHelpers) {
    let service = this;

    let pluginExpr = /[^\\]+\.es[plm]\\/i;

    // PRIVATE
    let mergeHasPlugin = function(merge, filename) {
        let lcFilename = filename.toLowerCase();
        return merge.plugins.findIndex(plugin => {
            return plugin.filename.toLowerCase() === lcFilename;
        }) > -1;
    };

    // PUBLIC API
    this.findGeneralAssets = function(folder, merge) {
        let exclusions = merge.rules.map(rule => {
            let pattern = `${folder}/${rule}`;
            return new fh.minimatch.Minimatch(pattern, { nocase: true });
        });
        return fh.getFiles(folder, { matching: '**/*' }).filter(filePath => {
            return !exclusions.find(expr => expr.match(filePath));
        });
    };

    this.findBsaFiles = function(plugin, folder) {
        return fh.getFiles(folder, {
            matching: `${fh.getFileBase(plugin)}*.@(bsa|ba2)`,
            recursive: false
        });
    };

    this.getOldPath = function(asset, merge) {
        return bsaHelpers.extractAsset(merge, asset) ||
            merge.dataFolders[asset.plugin || asset.plugins[0]] + asset.filePath;
    };

    this.getNewPath = function(asset, merge, expr, skipFn) {
        let newPath = asset.filePath.replace(/^[^\\]+\.(bsa|ba2)\\/i, '');
        if (!skipFn) newPath = newPath.replace(pluginExpr, match => {
            let plugin = match.slice(0, -1);
            if (!mergeHasPlugin(merge, plugin)) return match;
            return merge.filename + '\\';
        });
        return `${merge.dataPath}\\${!expr ? newPath :
            newPath.replace(expr, merge.fidReplacer[asset.plugin])}`;
    };

    this.copyAsset = function(asset, merge, expr, skipFn = false) {
        fh.jetpack.copy(
            service.getOldPath(asset, merge),
            service.getNewPath(asset, merge, expr, skipFn),
            { overwrite: true }
        );
    };

    this.copyToMerge = function(filePath, merge, localPath) {
        if (!localPath) localPath = fh.getFileName(filePath);
        fh.jetpack.copy(filePath, `${merge.dataPath}\\${localPath}`, {
            overwrite: true
        });
    };

    this.findGameAssets = function(plugin, folder, subfolder, expr) {
        let assets = fh.getFiles(folder + subfolder, { matching: expr }),
            fullExpr = `${subfolder}\\${expr}`;
        service.findBsaFiles(plugin, folder).forEach(bsaPath => {
            bsaHelpers.find(bsaPath, fullExpr).forEach(assetPath => {
                assets.push(`${bsaPath}\\${assetPath}`);
            });
        });
        return assets;
    };
});
