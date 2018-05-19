ngapp.run(function(integrationService) {
    integrationService.addIntegration({
        name: 'Papyrus',
        priority: 0,
        templateUrl: 'partials/integrations/papyrus.html',
        detect: function(settings) {
            // TODO
        },
        defaultSettings: {
            decompilerPath: '',
            compilerPath: '',
            flagsPath: ''
        }
    });
});