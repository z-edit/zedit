ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.start', {
        templateUrl: 'partials/start.html',
        controller: 'startController',
        url: '/start'
    });
}]);

ngapp.controller('startController', function ($scope, $rootScope, $state, $timeout, profileService, appModeService, argService, errorService) {
    let {getAppModes} = appModeService,
        {loadProfiles, getDefaultProfile, getProfiles} = profileService;

    // helper functions
    let selectAppMode = function(appModeId) {
        $scope.selectedAppMode = $scope.appModes.findByKey('id', appModeId) ||
            $scope.appModes.find(appMode => appMode.default);
    };

    let selectProfile = function(profileName) {
        let profile = $scope.profiles.findByKey('name', profileName);
        $scope.selectedProfile = profile || getDefaultProfile();
        if (profile) $timeout($scope.startSession);
    };

    let handleArgs = function() {
        selectAppMode(argService.getArgValue('-appMode'));
        selectProfile(argService.getArgValue('-profile'));
    };

    // scope functions
    $scope.startSession = function() {
        if (!appModeService.selectAppMode($scope.selectedAppMode)) return;
        profileService.selectProfile($scope.selectedProfile);
        $scope.$emit('sessionStarted', $scope.selectedProfile);
        let {loader} = $scope.selectedAppMode;
        appModeService.runLoader($scope, loader);
    };

    $scope.selectProfile = function(profile) {
        $scope.selectedProfile = profile;
    };

    $scope.selectAppMode = function(appMode) {
        $scope.selectedAppMode = appMode;
    };

    // event listeners
    $scope.$on('settingsClick', function() {
        if ($rootScope.profile) return;
        $scope.$emit('openModal', 'profiles');
    });

    $scope.$on('profilesUpdated', function() {
        $scope.profiles = getProfiles();
        $scope.selectedProfile = getDefaultProfile();
    });

    $scope.$watch('selectedProfile', function(profile) {
        $scope.background = profile.background;
        $scope.$emit('backgroundChanged', $scope.background);
    });

    // initialization
    loadProfiles();
    $scope.appVersion = window.appVersion;
    $scope.profiles = getProfiles();
    $scope.appModes = getAppModes();
    $timeout(() => window.startupCompleted = true);
    errorService.try(handleArgs);
});
