ngapp.service('mergeAssetService', function() {
    let handlers = [];

    // helper functions
    let fidReplacer = function(merge, plugin) {
        return function(match, fid) {
            let fidKey = fid.toUpperCase();
            if (merge.fidMap[plugin].hasOwnProperty(fidKey))
                return match.replace(fid, merge.fidMap[plugin][fidKey]);
            return match;
        };
    };

    let prepareToCopyAssets = function(merge) {
        merge.dataFolders = merge.plugins.reduce((obj, plugin) => {
            obj[plugin.filename] = plugin.dataPath;
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

    this.forEachPlugin = function(merge, callback) {
        merge.plugins.forEach(pluginObj => {
            callback(pluginObj.filename, pluginObj.dataFolder, pluginObj.handle);
        });
    };

    this.getAssets = function(merge) {
        handlers.forEach(handler => handler.get(merge));
    };

    this.handleAssets = function(merge) {
        prepareToCopyAssets(merge);
        handlers.forEach(handler => handler.handle(merge));
    };
});