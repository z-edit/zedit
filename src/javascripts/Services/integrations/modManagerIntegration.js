ngapp.run(function(integrationService) {
    integrationService.addIntegration({
        name: 'Mod Manager',
        priority: -1,
        templateUrl: 'partials/integrations/modManager.html',
        detect: function(settings) {
            // TODO
        },
        defaultSettings: {
            modManager: 'None',
            managerPath: '',
            modsPath: ''
        }
    });
});