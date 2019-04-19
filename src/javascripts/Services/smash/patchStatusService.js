ngapp.service('patchStatusService', function(settingsService, statusServiceFactory) {
    statusServiceFactory.buildStatusService(this, {
        itemPath: settingsService.settings.patchPath,
        pluginChangedMessage: 'Plugin changed.',
        getPluginChanged: (oldPlugin, plugin) => {
            return oldPlugin && (plugin.hash !== oldPlugin.hash);
        }
    });
});