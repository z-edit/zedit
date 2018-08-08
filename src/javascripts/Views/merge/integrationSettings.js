ngapp.controller('integrationSettingsController', function($scope, $rootScope, integrationService, progressService, errorService) {
    // initialization
    $scope.gameMode = $rootScope.profile.gameMode;
    $scope.integrations = integrationService.integrations;
    $scope.executablesFilter = [
        { name: 'Executables', extensions: ['exe'] }
    ];

    // scope functions
    $scope.detect = function() {
        progressService.showProgress({ message: 'Detecting integrations...' });
        errorService.tryEach($scope.integrations, integration => {
            integration.detect && integration.detect($scope.settings);
        });
        progressService.hideProgress();
    };

    $scope.initIntegration = function(integration) {
        integration.init && integration.init($scope);
    };
});

ngapp.run(function(settingsService, integrationService) {
    settingsService.registerSettings({
        label: 'Integration Settings',
        customActions: true,
        appModes: ['merge'],
        templateUrl: 'partials/settings/integrations.html',
        controller: 'integrationSettingsController',
        defaultSettings: integrationService.defaultSettings
    });
});
