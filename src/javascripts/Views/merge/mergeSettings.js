ngapp.controller('mergeSettingsController', function($scope, modManagerService) {
    let {getModManager} = modManagerService,
        integrationKeys = ['disableMods'];

    $scope.initIntegrationAvailability = function() {
        $scope.availableIntegrations = {};
        let modManager = getModManager($scope.settings.modManager);
        if (!modManager) return;
        integrationKeys.forEach(integrationKey => {
            if (!modManager.hasOwnProperty(integrationKey)) return;
            $scope.availableIntegrations[integrationKey] = true;
        });
    };

    $scope.browseMergePath = function() {
        let label = 'Select merge output folder',
            defaultPath = $scope.settings.mergePath,
            newPath = fh.selectDirectory(label, defaultPath);
        if (newPath) $scope.settings.mergePath = newPath;
    };
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Merge Settings',
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
