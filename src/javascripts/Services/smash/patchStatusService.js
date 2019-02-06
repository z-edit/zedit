ngapp.service('patchStatusService', function($rootScope, settingsService) {
    let getOldPlugin = function(patch, filename) {
        if (!patch.oldPlugins) return;
        return patch.oldPlugins.findByKey('filename', filename);
    };

    let pluginsChanged = function(patch) {
        return patch.plugins.filter(plugin => {
            let oldPlugin = getOldPlugin(patch, plugin.filename);
            plugin.added = !oldPlugin;
            plugin.changed = oldPlugin && (plugin.hash !== oldPlugin.hash ||
                plugin.dataFolder !== oldPlugin.dataFolder);
            return plugin.changed || plugin.added;
        }).length > 0;
    };

    let pluginAvailable = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin && !plugin.disabled;
    };

    let allPluginsAvailable = function(patch) {
        return patch.plugins.filter(function(plugin) {
            plugin.available = pluginAvailable(plugin.filename);
            return !plugin.available;
        }).length === 0;
    };

    let patchedPluginExists = function(patch) {
        let patchPath = settingsService.settings.patchPath,
            path = `${patchPath}\\${patch.name}\\${patch.filename}`;
        return fh.jetpack.exists(path);
    };

    let upToDate = function(patch) {
        return patchedPluginExists(patch) && !pluginsChanged(patch);
    };

    let getStatus = function(patch) {
        if (patch.plugins.length === 0) return 'No plugins to patch';
        if (!allPluginsAvailable(patch)) return 'Plugins unavailable';
        if (upToDate(patch)) return 'Up to date';
        return 'Ready to be built';
    };

    let getPluginTitle = function(plugin) {
        if (!plugin.available) return 'Plugin unavailable to load.';
        if (plugin.added) return 'Plugin just added to patch.';
        if (plugin.changed) return 'Plugin changed.';
    };

    let updatePluginTitles = function(patch) {
        patch.plugins.forEach(function(plugin) {
            plugin.title = getPluginTitle(plugin);
        });
    };

    this.updateStatus = function(patch) {
        patch.status = getStatus(patch);
        patch.canBuild = patch.status === 'Up to date' ||
            patch.status === 'Ready to be built';
        updatePluginTitles(patch);
    };
});
