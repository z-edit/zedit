ngapp.service('relinker', function(scriptsCache, bsaHelpers, pexService, settingsService) {
    let dataPath;

    let getMergedPlugins = function(merges) {
        let mergedPlugins = {};
        merges.forEach(merge => {
            merge.plugins.forEach(({filename}) => {
                mergedPlugins[filename] = merge.filename;
            });
        });
        return mergedPlugins;
    };

    let getScriptsToRelink = function(merges) {
        let cache = scriptsCache.update(),
            mergedPlugins = getMergedPlugins(merges);
        return cache.filter(entry => {
            return !!entry.fileRefs.find(file => {
                return mergedPlugins.hasOwnProperty(file);
            });
        });
    };

    let getDataPath = function() {
        if (!dataPath) dataPath = xelib.GetGlobal('DataPath');
        return dataPath;
    };

    let getScriptFilePath = function(entry) {
        let basePath = `scripts\\${entry.filename}`;
        return entry.bsa ? bsaHelpers.extractFile(entry.bsa, basePath) :
            `${getDataPath()}\\${basePath}`;
    };

    let fixFileRefs = function(script, merges) {
        // TODO
    };

    this.relinkScripts = function(merges) {
        let scripts = getScriptsToRelink(merges),
            {relinkerPath} = settingsService.settings;
        fh.jetpack.dir(`${relinkerPath}\\scripts`);
        scripts.forEach(entry => {
            let filePath = getScriptFilePath(entry);
            if (!filePath || !fh.jetpack.exists(filePath)) return;
            let script = pexService.loadScript(filePath),
                newPath = `${relinkerPath}\\scripts\\${entry.filename}`;
            fixFileRefs(script, merges);
            pexService.saveScript(script, newPath);
        });
    };
});
