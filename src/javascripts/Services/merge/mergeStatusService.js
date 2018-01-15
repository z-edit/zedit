ngapp.service('mergeStatusService', function($rootScope, settingsService) {
    let getOldPlugin = function(merge, filename) {
        if (!merge.oldPlugins) return;
        return merge.oldPlugins.findByKey('filename', filename);
    };

    let pluginChanged = function(merge, plugin) {
        let oldPlugin = getOldPlugin(merge, plugin.filename);
        return !oldPlugin || plugin.hash !== oldPlugin.hash ||
            plugin.dataFolder !== oldPlugin.dataFolder;
    };

    let pluginsChanged = function(merge) {
        return merge.plugins.filter(function(plugin) {
            plugin.changed = pluginChanged(merge, plugin);
            return plugin.changed;
        }).length > 0;
    };

    let pluginAvailable = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin && !plugin.disabled;
    };

    let allPluginsAvailable = function(merge) {
        return merge.plugins.filter(function(plugin) {
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
        return mergedPluginExists(merge) && !pluginsChanged(merge);
    };

    let getStatus = function(merge) {
        if (!allPluginsAvailable(merge)) return 'Plugins unavailable';
        if (upToDate(merge)) return 'Up to date';
        return 'Ready to be built';
    };

    let getPluginTitle = function(plugin) {
        if (!plugin.available) return 'Plugin unavailable to load.';
        if (plugin.changed) return 'Plugin changed or just added to merge.';
    };

    let updatePluginTitles = function(merge) {
        merge.plugins.forEach(function(plugin) {
            plugin.title = getPluginTitle(plugin);
        });
    };

    this.updateStatus = function(merge) {
        merge.status = getStatus(merge);
        updatePluginTitles(merge);
    };
});