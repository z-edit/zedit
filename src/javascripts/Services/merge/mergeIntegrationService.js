ngapp.service('mergeIntegrationService', function(settingsService, modManagerService) {
    let service = this;

    let runIntegration = function(key, modManager, merge) {
        let fn = (modManager && modManager[key]) || service[key];
        fn && fn(merge);
    };

    this.disablePlugins = function(merge) {
        // TODO
    };

    this.runIntegrations = function(merge) {
        let {mergeIntegrations, modManagerName} = settingsService.settings,
            modManager = modManagerService.getModManager(modManagerName);
        mergeIntegrations.keys().forEach(key => {
            if (!mergeIntegrations[key]) return;
            runIntegration(key, modManager, merge);
        });
    };
});
