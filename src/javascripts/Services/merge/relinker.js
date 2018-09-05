ngapp.service('relinker', function(scriptsCache, scriptHelpers, settingsService) {
    let {fileReferenceExpr, getSourceFileName, compileScript} = scriptHelpers;

    let getMergedPlugins = function(merges) {
        let plugins = [];
        merges.forEach(merge => {
            merge.plugins.mapOnKey('filename').forEach(filename => {
                if (!plugins.includes(filename)) plugins.push(filename);
            });
        });
        return plugins;
    };

    let getPluginMerge = function(merges, filename) {
        return merges.find(merge => {
            return !!merge.plugins.findByKey('filename', filename);
        });
    };

    let getScriptsToRelink = function(merges) {
        let cache = scriptsCache.update(),
            plugins = getMergedPlugins(merges);
        return cache.filter(entry => {
            return !!entry.files.find(f => plugins.includes(f));
        });
    };

    let updateSource = function(sourceCode, merges) {
        return sourceCode.replace(fileReferenceExpr, (m, filename) => {
            let merge = getPluginMerge(merges, filename);
            if (!merge) return m;
            return m.replace(filename, m.filename);
        });
    };

    this.relinkScripts = function(merges) {
        let scripts = getScriptsToRelink(merges),
            {relinkPath} = settingsService.settings,
            scriptsPath = `${relinkPath}\\Scripts`,
            sourcePath = `${scriptsPath}\\source`;
        scripts.forEach(script => {
            let sourceCode = scriptsCache.loadSourceCode(script.filename),
                updatedSource = updateSource(sourceCode, merges),
                sourceName = getSourceFileName(script.filename),
                pscPath = `${sourcePath}\\${sourceName}`,
                pexPath = `${scriptsPath}\\${script.filename}`;
            fh.saveTextFile(pscPath, updatedSource);
            compileScript(pscPath, pexPath);
        });
    };
});
