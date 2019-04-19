ngapp.service('statusServiceFactory', function($rootScope) {
    this.buildStatusService = function(service, options) {
        let {
            itemPath, pluginChangedMessage,
            noPluginsMessage, getPluginChanged
        } = options;

        // private
        let getPluginObject = function(plugins, filename) {
            return plugins && plugins.findByKey('filename', filename);
        };

        let pluginsChanged = function(item) {
            return item.plugins.reduce((b, plugin) => {
                let oldPlugin = getPluginObject(item.oldPlugins, plugin.filename);
                plugin.added = !oldPlugin;
                plugin.changed = getPluginChanged(oldPlugin, plugin);
                return b || plugin.changed || plugin.added;
            }, false);
        };

        let pluginsRemoved = function(item) {
            return item.oldPlugins.reduce((b, plugin) => {
                return b || !getPluginObject(item.plugins, plugin.filename);
            }, false);
        };

        let pluginAvailable = function(filename) {
            let plugin = $rootScope.loadOrder.findByKey('filename', filename);
            return plugin && !plugin.disabled;
        };

        let allPluginsAvailable = function(item) {
            return item.plugins.reduce((b, plugin) => {
                plugin.available = pluginAvailable(plugin.filename);
                return b && plugin.available;
            }, true);
        };

        let itemdPluginExists = function(item) {
            let path = fh.path(itemPath, item.name, item.filename);
            return fh.jetpack.exists(path);
        };

        let upToDate = function(item) {
            return itemdPluginExists(item) && !pluginsChanged(item)
                && !pluginsRemoved(item);
        };

        let getStatus = function(item) {
            if (item.plugins.length === 0) return noPluginsMessage;
            if (!allPluginsAvailable(item)) return 'Plugins unavailable';
            if (upToDate(item)) return 'Up to date';
            return 'Ready to be built';
        };

        let getPluginTitle = function(plugin) {
            if (!plugin.available) return 'Plugin unavailable to load.';
            if (plugin.added) return 'Plugin just added to item.';
            if (plugin.changed) return pluginChangedMessage;
        };

        let updatePluginTitles = function(item) {
            item.plugins.forEach(plugin => {
                plugin.title = getPluginTitle(plugin);
            });
        };

        // public
        service.updateStatus = function(item) {
            item.status = getStatus(item);
            item.canBuild = item.status === 'Up to date' ||
                item.status === 'Ready to be built';
            updatePluginTitles(item);
        };

        service.readyToBeBuilt = function(item) {
            return item.status === 'Ready to be built';
        };
    }
});