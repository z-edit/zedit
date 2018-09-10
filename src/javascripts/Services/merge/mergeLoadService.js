ngapp.service('mergeLoadService', function($rootScope, $q, $timeout, progressService, mergeLogger) {
    let loaded;

    let getMasters = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin.masterNames;
    };

    let getLoadOrder = function(merge) {
        let plugins = [],
            masters = [];
        merge.plugins.forEach(function(plugin) {
            plugins.push(plugin.filename);
            getMasters(plugin.filename).forEach(function(master) {
                if (masters.includes(master) ||
                    plugins.includes(master)) return;
                masters.push(master);
            });
        });
        return masters.concat(plugins);
    };

    let getLoadStatus = function(desiredLoadOrder) {
        for (let i = 0; i < desiredLoadOrder.length; i++){
            let plugin = xelib.FileByLoadOrder(i);
            if (!plugin || xelib.GetFileName(plugin) !== desiredLoadOrder[i])
                return { badIndex: i };
        }
        return { loaded: true };
    };

    let logMessages = function() {
        let messages = xelib.GetMessages();
        if (messages.length < 1) return;
        messages.split('\n').forEach(msg => msg && mergeLogger.log(msg));
    };

    let checkIfLoaded = function() {
        logMessages();
        let loaderStatus = xelib.GetLoaderStatus();
        if (loaderStatus === xelib.lsDone) {
            loaded.resolve('filesLoaded');
        } else if (loaderStatus === xelib.lsError) {
            loaded.reject('There was a critical error during ' +
                'plugin/resource loading.');
        } else {
            $timeout(checkIfLoaded, 250);
        }
    };

    let unloadAfterIndex = function(index) {
        let fileCount = parseInt(xelib.GetGlobal('FileCount'));
        for (let i = fileCount - 1; i >= 0; i--) {
            let plugin = xelib.FileByIndex(i);
            if (xelib.GetLoadOrder(plugin) < index) return;
            mergeLogger.log(`Unloading ${xelib.Name(plugin)}`);
            xelib.UnloadPlugin(plugin);
            xelib.Release(plugin);
        }
    };

    let logLoadOrder = function(loadOrder) {
        let msg = '\r\nLoad order:\r\n' + loadOrder
            .map((p, i) => `[${xelib.Hex(i, 2)}] ${p}`)
            .join('\r\n');
        mergeLogger.log(msg);
    };

    // PUBLIC API
    this.loadPlugins = function(merge) {
        mergeLogger.log('Getting merge load order...');
        let loadOrder = getLoadOrder(merge),
            status = getLoadStatus(loadOrder);
        logLoadOrder(loadOrder);
        loaded = $q.defer();
        if (status.loaded) {
            mergeLogger.progress('Plugins already loaded.');
            loaded.resolve('alreadyLoaded');
        } else {
            let pluginsToLoad = loadOrder.slice(status.badIndex),
                numPlugins = pluginsToLoad.length;
            unloadAfterIndex(status.badIndex);
            mergeLogger.progress(`Loading ${numPlugins} plugins...`);
            xelib.ClearMessages();
            xelib.LoadPlugins(pluginsToLoad.join('\n'), false);
            checkIfLoaded();
        }
        return loaded.promise;
    };
});
