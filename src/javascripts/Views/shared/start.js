ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.start', {
        templateUrl: 'partials/start.html',
        controller: 'startController',
        url: '/start'
    });
}]);

ngapp.controller('startController', function ($scope, $rootScope, $state, $timeout, profileService,  appModeService) {
    // initialization
    profileService.validateProfiles();
    $scope.appVersion = appVersion;
    $scope.profiles = profileService.profiles;
    $scope.appModes = appModeService.getAppModes();
    $scope.selectedProfile = profileService.getDefaultProfile();
    $scope.selectedAppMode = $scope.appModes[0];
    $timeout(() => window.startupCompleted = true, 100);

    // scope functions
    $scope.checkHardcodedDat = function() {
        let game = profileService.getGame($scope.selectedProfile.gameMode);
        let fileName = game.shortName + '.Hardcoded.dat';
        if (fh.jetpack.exists(fileName)) return true;
        alert(`Error: Required file "${fileName}" not found, please re-install the application.`);
    };

    $scope.startSession = function () {
        if (!appModeService.selectAppMode($scope.selectedAppMode)) return;
        profileService.selectProfile($scope.selectedProfile);
        appModeService.runLoader($scope);
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
