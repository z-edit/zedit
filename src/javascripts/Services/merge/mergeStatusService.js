ngapp.service('mergeStatusService', function(settingsService, statusServiceFactory) {
    statusServiceFactory.buildStatusService(this, {
        itemPath: settingsService.settings.mergePath,
        pluginChangedMessage: 'Plugin or data folder changed.',
        noPluginsMessage: 'No plugins to merge.',
        getPluginChanged: (oldPlugin, plugin) => {
            return oldPlugin && (plugin.hash !== oldPlugin.hash ||
                plugin.dataFolder !== oldPlugin.dataFolder);
        }
    })
});