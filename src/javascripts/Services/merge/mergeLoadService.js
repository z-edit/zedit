ngapp.service('mergeLoadService', function($rootScope, $q, $timeout, progressService, progressLogger) {
    let loaded;

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
        let fileCount = xelib.ElementCount(0);
        progressLogger.log('Unloading plugins');
        for (let i = fileCount - 1; i >= 0; i--) {
            let plugin = xelib.FileByIndex(i);
            if (xelib.GetFileLoadOrder(plugin) <= index) return;
            progressLogger.log(`Unloading ${xelib.Name(plugin)}`, true);
            xelib.UnloadPlugin(plugin);
            xelib.Release(plugin);
        }
    };

    // PUBLIC API
    this.loadPlugins = function(merge) {
        let loadOrder = merge.plugins.mapOnKey('filename').join('\n');
        loaded = $q.defer();
        unloadAfterIndex(-1);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder, true);
        checkIfLoaded();
        return loaded.promise;
    };

    this.unload = function(merge) {
        unloadAfterIndex(-1);
        merge.plugins.forEach(plugin => { delete plugin.handle });
        delete merge.plugin;
    }
});
