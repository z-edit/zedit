ngapp.controller('mergeSettingsController', function($scope, modManagerService) {
    let {getModManager} = modManagerService,
        integrationKeys = ['moHidden', 'disableMods'];

    $scope.initIntegrationAvailability = function() {
        $scope.availableIntegrations = {};
        let modManager = getModManager($scope.settings.modManager);
        if (!modManager) return;
        integrationKeys.forEach(integrationKey => {
            if (!modManager.hasOwnProperty(integrationKey)) return;
            $scope.availableIntegrations[integrationKey] = true;
        });
    };
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Merge Settings',
        appModes: ['merge'],
        templateUrl: 'partials/settings/merge.html',
        defaultSettings: {
            mergePath: fh.appDir.path('merges'),
            mergeIntegrations: {
                disablePlugins: true,
                moHidden: false,
                disableMods: false
            }
        }
    });
});
