ngapp.service('mergeStatusService', function(settingsService, statusServiceFactory) {
    statusServiceFactory.buildStatusService(this, {
        itemPath: settingsService.settings.mergePath,
        pluginChangedMessage: 'Plugin or data folder changed.',
        getPluginChanged: (oldPlugin, plugin) => {
            return oldPlugin && (plugin.hash !== oldPlugin.hash ||
                plugin.dataFolder !== oldPlugin.dataFolder);
        }
    })
});