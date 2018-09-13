ngapp.service('relinker', function(scriptsCache, pexService) {

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
            return !!entry.fileRefs.find(ref => {
                return mergedPlugins.hasOwnProperty(ref.plugin);
            });
        });
    };

    this.relinkScripts = function(merges) {
        let scripts = getScriptsToRelink(merges);
        scripts.forEach(script => {
            // 1: get script filePath,
            // 1A: extract if necessary
            // 1B: exit if does not exist
            // 2: load script using pexService
            // 3: iterate through calls, fix file refs
            // 4: save script
        });
    };
});
