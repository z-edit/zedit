ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.start', {
        templateUrl: 'partials/start.html',
        controller: 'startController',
        url: '/start'
    });
}]);

ngapp.controller('startController', function ($scope, $rootScope, profileService, settingsService, appModeService, xelibService) {
    // initialization
    profileService.validateProfiles();
    $scope.profiles = profileService.profiles;
    $scope.appModes = appModeService.applicationModes;
    $scope.selectedProfile = profileService.getDefaultProfile();
    $scope.selectedAppMode = $scope.appModes[0];

    // scope functions
    $scope.getLoadOrder = function () {
        let loadOrder = xelib.GetLoadOrder().split('\r\n');
        let activePlugins = xelib.GetActivePlugins().split('\r\n');
        console.log('Load Order:\n' + loadOrder);
        console.log('Active Plugins:\n' + activePlugins);
        return loadOrder.map(function(filename) {
            let handle = xelib.LoadPluginHeader(filename);
            try {
                return {
                    filename: filename,
                    masterNames: xelib.GetMasterNames(handle),
                    active: activePlugins.includes(filename)
                }
            } finally {
                xelib.UnloadPlugin(handle);
            }
        })
    };

    $scope.checkHardcodedDat = function() {
        let game = profileService.getGame($scope.selectedProfile.gameMode);
        let fileName = game.shortName + '.Hardcoded.dat';
        if (fh.jetpack.exists(fileName)) return true;
        alert(`Error: Required file "${fileName}" not found, please re-install the application.`);
    };

    $scope.startSession = function () {
        if (!$scope.checkHardcodedDat()) return;
        $rootScope.profile = $scope.selectedProfile;
        $rootScope.appMode = $scope.selectedAppMode;
        settingsService.loadProfileSettings($scope.selectedProfile.name);
        xelibService.startSession($scope.selectedProfile);
        $scope.$emit('setTitle', 'zEdit - Selecting Load Order');
        $scope.$emit('sessionStarted', $scope.selectedProfile);
        $scope.$emit('openModal', 'loadOrder', {
            loadOrder: $scope.getLoadOrder()
        });
    };

    // event listeners
    $scope.$on('settingsClick', function() {
        if ($rootScope.profile) return;
        $scope.$emit('openModal', 'profiles');
    });

    $scope.$on('profilesUpdated', function() {
        $scope.selectedProfile = profileService.getDefaultProfile();
    });
});
