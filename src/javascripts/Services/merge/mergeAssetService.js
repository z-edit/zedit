ngapp.service('mergeAssetService', function(progressLogger, gameService) {
    let handlers = [];

    // helper functions
    let fidReplacer = function(merge, plugin) {
        return function(match, fid) {
            let fidKey = fid.slice(2).toUpperCase();
            if (merge.fidMap[plugin].hasOwnProperty(fidKey))
                return match.replace(fid, merge.fidMap[plugin][fidKey]);
            return match;
        };
    };

    let prepareToCopyAssets = function(merge) {
        merge.dataFolders = merge.plugins.reduce((obj, plugin) => {
            obj[plugin.filename] = plugin.dataFolder;
            return obj;
        }, {});
        merge.fidReplacer = merge.plugins.reduce((obj, plugin) => {
            obj[plugin.filename] = fidReplacer(merge, plugin.filename);
            return obj;
        }, {});
    };

    // api functions
    this.addHandler = function(handler) {
        handlers.push(handler);
        handlers.sortOnKey('priority');
    };

    this.forEachPlugin = function(merge, callback, options = {}) {
        let {useGameDataFolder} = options;
        merge.plugins.forEach(({filename, dataFolder, handle}) => {
            if (useGameDataFolder) dataFolder = gameService.dataPath;
            callback(filename, dataFolder, handle);
        });
    };

    this.getAssets = function(merge) {
        handlers.forEach(h => h.get && h.get(merge));
    };

    this.handleAssets = function(merge) {
        progressLogger.progress('Handling asset files...');
        prepareToCopyAssets(merge);
        handlers.forEach(h => h.handle && h.handle(merge));
    };

    this.cleanup = function(merge) {
        handlers.forEach(h => h.cleanup && h.cleanup(merge));
    }
});
