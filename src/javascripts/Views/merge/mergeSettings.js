ngapp.controller('mergeSettingsController', function($scope, modManagerService) {
    let {getModManager} = modManagerService,
        integrationKeys = ['disableMods'];

    $scope.availableIntegrations = {};
    let modManager = getModManager($scope.settings.modManager);
    if (!modManager) return;
    integrationKeys.forEach(integrationKey => {
        if (!modManager.hasOwnProperty(integrationKey)) return;
        $scope.availableIntegrations[integrationKey] = true;
    });
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Merge Settings',
        controller: 'mergeSettingsController',
        appModes: ['merge'],
        templateUrl: 'partials/settings/merge.html',
        defaultSettings: {
            mergePath: fh.jetpack.path('merges'),
            mergeIntegrations: {
                disablePlugins: true,
                disableMods: false
            }
        }
    });
});
