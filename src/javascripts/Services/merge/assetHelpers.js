ngapp.service('assetHelpers', function(bsaHelpers, mergeLogger) {
    let service = this;

    let archiveExpr = /^[^\\]+\.(bsa|ba2)\\/i,
        pluginExpr = /[^\\]+\.es[plm]\\/i;

    // PRIVATE
    let mergeHasPlugin = function(merge, filename) {
        let lcFilename = filename.toLowerCase();
        return merge.plugins.findIndex(plugin => {
            return plugin.filename.toLowerCase() === lcFilename;
        }) > -1;
    };

    let getRules = function(merge) {
        let rules = ['**/*.@(esp|esm|bsa|ba2|bsl)', 'meta.ini',
            'translations/**/*', 'TES5Edit Backups/**/*', 'fomod/**/*',
            'screenshot?(s)/**/*'];
        merge.plugins.forEach(plugin => {
            let basePluginName = fh.getFileBase(plugin.filename);
            rules.push(`**/${basePluginName}.@(seq|ini)`,
                `**/${plugin.filename}/**/*`);
        });
        return rules;
    };

    let assetFolder = function(asset, merge) {
        return merge.dataFolders[asset.plugin || asset.plugins[0]];
    };

    // PUBLIC API
    this.findGeneralAssets = function(folder, merge) {
        let exclusions = getRules(merge).map(rule => {
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
            (assetFolder(asset, merge) + asset.filePath);
    };

    this.getNewPath = function(asset, merge, expr, skipFn) {
        let newPath = asset.filePath.replace(archiveExpr, '');
        if (!skipFn) newPath = newPath.replace(pluginExpr, match => {
            let plugin = match.slice(0, -1);
            if (!mergeHasPlugin(merge, plugin)) return match;
            return merge.filename + '\\';
        });
        return `${merge.dataPath}\\${!expr ? newPath :
            newPath.replace(expr, merge.fidReplacer[asset.plugin])}`;
    };

    this.copyAsset = function(asset, merge, expr, skipFn = false) {
        let oldPath = service.getOldPath(asset, merge),
            newPath = service.getNewPath(asset, merge, expr, skipFn);
        mergeLogger.log(`Copying ${oldPath} to ${newPath}`, true);
        fh.jetpack.copy(oldPath, newPath, { overwrite: true });
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
