ngapp.service('assetHelpers', function(bsaHelpers, progressLogger) {
    let service = this,
        Minimatch = fh.minimatch.Minimatch;

    let archiveExpr = /^[^\\]+\.(bsa|ba2)\\/i,
        pluginExpr = /[^\\]+\.es[plm]\\/i,
        fragmentExpr = /.*scripts[\/\\].*_[a-f0-9]{8}.pex$/i;

    // PRIVATE
    let mergeHasPlugin = function(merge, filename) {
        let lcFilename = filename.toLowerCase();
        return merge.plugins.contains(plugin => {
            return plugin.filename.toLowerCase() === lcFilename;
        });
    };

    let getRules = function(merge) {
        let rules = ['**/*.@(esp|esm|bsa|ba2|bsl)', 'meta.ini',
            'interface/translations/*.txt', 'TES5Edit Backups/**/*',
            'fomod/**/*', 'screenshot?(s)/**/*', 'scripts/source/*.psc'];
        merge.plugins.forEach(plugin => {
            let basePluginName = fh.getFileBase(plugin.filename);
            rules.push(`**/${fh.escapePattern(basePluginName)}.@(seq|ini)`);
            rules.push(`**/${fh.escapePattern(plugin.filename)}/**/*`);
        });
        return rules;
    };

    // PUBLIC API
    this.findGeneralAssets = function(folder, merge) {
        let basePattern = fh.escapePattern(folder);
        let exclusions = getRules(merge).map(rule => {
            let pattern = `${basePattern}/${rule}`;
            return new Minimatch(pattern, { nocase: true });
        });
        exclusions.push({ match: str => fragmentExpr.test(str) });
        return fh.getFiles(folder, { matching: '**/*' }).filter(filePath => {
            return !exclusions.find(expr => expr.match(filePath));
        });
    };

    this.findBsaFiles = function(plugin, folder) {
        return fh.getFiles(folder, {
            matching: `${fh.getFileBase(plugin)}*.@(bsa|ba2)`,
            recursive: false
        }).map(path => path.replace(/\//g, '\\'));
    };

    this.getOldPath = function(asset, merge) {
        return bsaHelpers.extractAsset(asset) ||
            (asset.folder + asset.filePath);
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
        progressLogger.log(`Copying ${oldPath} to ${newPath}`, true);
        fh.jetpack.copy(oldPath, newPath, { overwrite: true });
    };

    this.findGameAssets = function(plugin, folder, subfolder, expr) {
        let options = { matching: expr, ignoreCase: true },
            assets = fh.getFiles(folder + subfolder, options),
            baseExpr = fh.escapePattern(subfolder),
            fullExpr = `${baseExpr}/${expr}`;
        service.findBsaFiles(plugin, folder).forEach(bsaPath => {
            bsaHelpers.find(bsaPath, fullExpr).forEach(assetPath => {
                assets.push(`${bsaPath}\\${assetPath}`);
            });
        });
        return assets;
    };
});
