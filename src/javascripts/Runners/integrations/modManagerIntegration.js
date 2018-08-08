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
                    return obj;
                }, {});
            });
        },
        detect: function(settings) {
            let {modManagers} = modManagerService;
            let modManager = modManagers.find(manager => {
                return manager.name === settings.modManager;
            });
            if (modManager)
                return modManager.detect && modManager.detect(settings);
            for (let i = 0; i < modManagers.length; i++) {
                settings.modManager = modManagers[i].name;
                let foundPath = modManagers[i].detect(settings);
                if (foundPath) return foundPath;
            }
            settings.modManager = null;
        },
        defaultSettings: {
            modManager: 'None',
            managerPath: '',
            modsPath: ''
        }
    });
});
