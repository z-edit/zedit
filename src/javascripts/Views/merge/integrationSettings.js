ngapp.controller('integrationSettingsController', function($scope, $rootScope, integrationService, progressService, errorService) {
    // initialization
    const modOrganizerManagers = ['Mod Organizer', 'Mod Organizer 2'];

    let updateDataFolders = false;

    $scope.gameMode = $rootScope.profile.gameMode;
    $scope.integrations = integrationService.integrations;
    $scope.executablesFilter = [
        { name: 'Executables', extensions: ['exe'] }
    ];

    // helper functions
    let usingDefaultMergePath = function() {
        return $scope.settings.mergePath === fh.jetpack.path('merges');
    };

    let usingMO = function() {
        return modOrganizerManagers.includes($scope.settings.modManager);
    };

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

    $scope.$on('$destroy', function() {
        if (updateDataFolders) $rootScope.$broadcast('updateDataFolders');
    });

    $scope.$watch('settings.modsPath', () => {
        updateDataFolders = true;
        if (usingMO() && usingDefaultMergePath())
            $scope.settings.mergePath = $scope.settings.modsPath;
    });
    $scope.$watch('settings.modManager', () => updateDataFolders = true);
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
