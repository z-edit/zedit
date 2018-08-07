ngapp.run(function(integrationService, modManagerService, modOrganizerService) {
    integrationService.addIntegration({
        name: 'Mod Manager',
        priority: -1,
        templateUrl: 'partials/integrations/modManager.html',
        init: scope => {
            scope.modManagers = modManagerService.modManagers;

            scope.getModOrganizerInstances = function() {
                scope.moInstances = modOrganizerService.getInstances();
            };

            scope.$watch('settings.modManager', () => {
                let manager = scope.modManagers.find(item => {
                    return item.name === scope.settings.modManager;
                });
                let showItems = manager ? manager.show : [];
                scope.show = showItems.reduce((obj, key) => {
                    obj[key] = true;
                }, {});
            });
        },
        detect: function(settings) {
            let {modManagers} = modManagerService;
            let modManager = modManagers.find(manager => {
                return manager.name === settings.modManager;
            });
            if (!modManager || !modManager.detect) return;
            return modManager.detect(settings);
        },
        defaultSettings: {
            modManager: 'None',
            managerPath: '',
            modsPath: ''
        }
    });
});
