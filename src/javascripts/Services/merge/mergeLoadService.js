ngapp.service('mergeLoadService', function($rootScope, $q, $timeout, progressService, progressLogger) {
    let loaded;

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
        messages.split('\n').forEach(msg => msg && progressLogger.log(msg));
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
        progressLogger.log('Unloading plugins');
        for (let i = fileCount - 1; i >= 0; i--) {
            let plugin = xelib.FileByIndex(i);
            if (xelib.GetFileLoadOrder(plugin) <= index) return;
            progressLogger.log(`Unloading ${xelib.Name(plugin)}`, true);
            xelib.UnloadPlugin(plugin);
            xelib.Release(plugin);
        }
    };

    let logLoadOrder = function(loadOrder) {
        let msg = '\r\nLoad order:\r\n' + loadOrder
            .map((p, i) => `[${xelib.Hex(i, 2)}] ${p}`)
            .join('\r\n');
        progressLogger.log(msg);
    };

    let mergeHasPlugin = function(merge, filename) {
        return !!merge.plugins.findByKey('filename', filename);
    };

    // PUBLIC API
    this.loadPlugins = function(merge) {
        let status = getLoadStatus(merge.loadOrder);
        logLoadOrder(merge.loadOrder);
        loaded = $q.defer();
        if (status.loaded) {
            progressLogger.progress('Plugins already loaded.');
            loaded.resolve('alreadyLoaded');
        } else {
            let pluginsToLoad = merge.loadOrder.slice(status.badIndex),
                numPlugins = pluginsToLoad.length;
            unloadAfterIndex(-1);
            progressLogger.progress(`Loading ${numPlugins} plugins...`);
            xelib.ClearMessages();
            xelib.LoadPlugins(pluginsToLoad.join('\n'), false);
            checkIfLoaded();
        }
        return loaded.promise;
    };

    this.unload = function(merge) {
        let firstIndex = merge.loadOrder.findIndex(filename => {
            return mergeHasPlugin(merge, filename);
        });
        unloadAfterIndex(-1);
        merge.plugins.forEach(plugin => { delete plugin.handle });
        delete merge.plugin;
    }
});
