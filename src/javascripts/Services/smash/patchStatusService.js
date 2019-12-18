ngapp.service('patchStatusService', function(settingsService, statusServiceFactory) {
    statusServiceFactory.buildStatusService(this, {
        itemPath: settingsService.settings.smash.patchPath,
        pluginChangedMessage: 'Plugin changed.',
        noPluginsMessage: 'No plugins to patch.',
        getPluginChanged: (oldPlugin, plugin) => {
            return oldPlugin && (plugin.hash !== oldPlugin.hash);
        }
    });
});
