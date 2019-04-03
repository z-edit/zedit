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

    let getNotContiguousMessage = function(badPlugin) {
        return badPlugin + ' makes the plugins to be merged not contiguous. ' +
            'The clobber merge method requires the plugins being merged to ' +
            'be contiguous. Please edit the merge and rearrange the plugins ' +
            'being merged so they are loaded after the plugins they require.';
    };

    let notContiguous = function(merge) {
        if (merge.method !== 'Clobber') return;
        let started = false;
        let badPlugin = merge.loadOrder.find(filename => {
            let plugin = merge.plugins.findByKey('filename', filename);
            if (started && !plugin) return true;
            started = !!plugin;
        });
        if (!badPlugin) return;
        let message = getNotContiguousMessage(badPlugin);
        loaded.reject(message);
        return true;
    };

    // PUBLIC API
    this.loadPlugins = function(merge) {
        loaded = $q.defer();
        if (notContiguous(merge)) return loaded.promise;
        unloadAfterIndex(-1);
        xelib.ClearMessages();
        xelib.LoadPlugins(merge.loadOrder.join('\n'), true);
        checkIfLoaded();
        return loaded.promise;
    };

    this.resetMergeLoadOrder = function(merge) {
        merge.loadOrder = $rootScope.loadOrder
            .mapOnKey('filename')
            .filter(filename => {
                return merge.plugins.contains(p => p.filename === filename);
            });
    };

    this.unload = function(merge) {
        unloadAfterIndex(-1);
        merge.plugins.forEach(plugin => { delete plugin.handle });
        delete merge.plugin;
    };
});
