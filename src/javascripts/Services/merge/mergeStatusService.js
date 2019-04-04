ngapp.service('mergeStatusService', function($rootScope, settingsService) {
    let getPluginObject = function(plugins, filename) {
        return plugins && plugins.findByKey('filename', filename);
    };

    let pluginsChanged = function(merge) {
        return merge.plugins.reduce((b, plugin) => {
            let oldPlugin = getPluginObject(merge.oldPlugins, plugin.filename);
            plugin.added = !oldPlugin;
            plugin.changed = oldPlugin && (plugin.hash !== oldPlugin.hash ||
                plugin.dataFolder !== oldPlugin.dataFolder);
            return b || plugin.changed || plugin.added;
        }, false);
    };

    let pluginsRemoved = function(merge) {
        return merge.oldPlugins.reduce((b, plugin) => {
            return b || !getPluginObject(merge.plugins, plugin.filename);
        }, false);
    };

    let pluginAvailable = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin && !plugin.disabled;
    };

    let allPluginsAvailable = function(merge) {
        return merge.plugins.filter(plugin => {
            plugin.available = pluginAvailable(plugin.filename);
            return !plugin.available;
        }).length === 0;
    };

    let mergedPluginExists = function(merge) {
        let mergePath = settingsService.settings.mergePath,
            path = `${mergePath}\\${merge.name}\\${merge.filename}`;
        return fh.jetpack.exists(path);
    };

    let upToDate = function(merge) {
        return mergedPluginExists(merge) && !pluginsChanged(merge)
            && !pluginsRemoved(merge);
    };

    let getStatus = function(merge) {
        if (merge.plugins.length === 0) return 'No plugins to merge';
        if (!allPluginsAvailable(merge)) return 'Plugins unavailable';
        if (upToDate(merge)) return 'Up to date';
        return 'Ready to be built';
    };

    let getPluginTitle = function(plugin) {
        if (!plugin.available) return 'Plugin unavailable to load.';
        if (plugin.added) return 'Plugin just added to merge.';
        if (plugin.changed) return 'Plugin or data folder changed.';
    };

    let updatePluginTitles = function(merge) {
        merge.plugins.forEach(plugin => {
            plugin.title = getPluginTitle(plugin);
        });
    };

    this.updateStatus = function(merge) {
        merge.status = getStatus(merge);
        merge.canBuild = merge.status === 'Up to date' ||
            merge.status === 'Ready to be built';
        updatePluginTitles(merge);
    };
});
