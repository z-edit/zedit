ngapp.service('pluginLoadService', function($rootScope, $q, $timeout, progressService) {
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

    let logMessage = function(msg) {
        progressService.progressMessage(msg);
    };

    let logMessages = function() {
        let messages = xelib.GetMessages().split('\n');
        messages.slice(0, -1).forEach(logMessage);
    };

    let checkIfLoaded = function() {
        let loaderStatus = xelib.GetLoaderStatus();
        logMessages();
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
            xelib.UnloadPlugin(plugin);
        }
    };

    // PUBLIC API
    this.loadPlugins = function(merge) {
        let loadOrder = getLoadOrder(merge),
            status = getLoadStatus(loadOrder);
        loaded = $q.defer();
        if (status.loaded) {
            loaded.resolve('alreadyLoaded');
        } else {
            let loadOrderStr = loadOrder.slice(status.badIndex).join('\n');
            unloadAfterIndex(status.badIndex);
            xelib.LoadPlugins(loadOrderStr, false);
            checkIfLoaded();
        }
        return loaded.promise;
    };
});