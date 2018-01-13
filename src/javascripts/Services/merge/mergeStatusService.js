ngapp.service('mergeStatusService', function($rootScope) {
    let pluginChanged = function(plugin) {
        let oldPlugin = getOldPlugin(merge, plugin.filename);
        if (!oldPlugin) return true;
        if (plugin.hash !== oldPlugin.hash) return true;
        //if (plugin.)
    };

    let pluginsChanged = function(merge) {
        return merge.plugins.filter(function(plugin) {
            plugin.changed = pluginChanged(plugin);
            return plugin.changed;
        }).length > 0;
    };

    let pluginAvailable = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin && plugin.available;
    };

    let allPluginsAvailable = function(merge) {
        return merge.plugins.filter(function(plugin) {
            plugin.available = pluginAvailable(plugin.filename);
            return !plugin.available;
        }).length === 0;
    };

    let getStatus = function(merge) {
        if (merge.built) return 'Built';
        if (!allPluginsAvailable(merge)) return 'Plugins unavailable';
        if (!pluginsChanged(merge)) return 'Up to date';
        return 'Ready to be built';
    };

    this.updateStatus = function(merge) {
        merge.status = getStatus(merge);
    };
});