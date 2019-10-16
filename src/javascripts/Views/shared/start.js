ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.start', {
        templateUrl: 'partials/start.html',
        controller: 'startController',
        url: '/start'
    });
}]);

ngapp.controller('startController', function ($scope, $rootScope, $state, $timeout, profileService, appModeService, argService, errorService) {
    // helper functions
    let selectAppMode = function(appModeName) {
        $scope.selectedAppMode = $scope.appModes.includes(appModeName) ?
            appModeName : $scope.appModes[0];
    };

    let selectProfile = function(profileName) {
        $scope.selectedProfile = profileName ?
            $scope.profiles.findByKey('name', profileName) :
            profileService.getDefaultProfile();
        if (!$scope.selectedProfile) return;
        if ($scope.selectedProfile.name === profileName)
            $timeout($scope.startSession);
    };

    let handleArgs = function() {
        selectAppMode(argService.getArgValue('-appMode'));
        selectProfile(argService.getArgValue('-profile'));
    };

    // scope functions
    $scope.startSession = function () {
        if (!appModeService.selectAppMode($scope.selectedAppMode)) return;
        profileService.selectProfile($scope.selectedProfile);
        $scope.$emit('sessionStarted', $scope.selectedProfile);
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

    // initialization
    profileService.validateProfiles();
    $scope.appVersion = appVersion;
    $scope.profiles = profileService.profiles;
    $scope.appModes = appModeService.getAppModes();
    $timeout(() => window.startupCompleted = true);
    errorService.try(handleArgs);
});
