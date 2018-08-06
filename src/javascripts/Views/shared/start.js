ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.start', {
        templateUrl: 'partials/start.html',
        controller: 'startController',
        url: '/start'
    });
}]);

ngapp.controller('startController', function ($scope, $rootScope, $timeout, profileService, settingsService, appModeService, xelibService, loadOrderService) {
    // initialization
    profileService.validateProfiles();
    $scope.appVersion = appVersion;
    $scope.profiles = profileService.profiles;
    $scope.appModes = appModeService.getAppModes();
    $scope.selectedProfile = profileService.getDefaultProfile();
    $scope.selectedAppMode = $scope.appModes[0];
    $timeout(() => window.startupCompleted = true, 100);

    // helper functions
    let getMasterNames = function(filename) {
        let handle;
        try {
            handle = xelib.LoadPluginHeader(filename);
            return xelib.GetMasterNames(handle);
        } catch(x) {
            console.log(x);
        } finally {
            if (handle) xelib.UnloadPlugin(handle);
        }
    };

    let confirmCleanMode = function() {
        return confirm('The zClean application mode is still being developed.  Cleaning plugins may lead to CTDs.  Backups of any plugins cleaned with zClean will be saved to the zEdit Backups folder in your game\'s data directory.  Are you sure you want to proceed?');
    };

    let getLoadOrder = function () {
        let loadOrder = xelib.GetLoadOrder().split('\r\n');
        let activePlugins = xelib.GetActivePlugins().split('\r\n');
        console.log('Load Order:\n' + loadOrder);
        console.log('Active Plugins:\n' + activePlugins);
        return loadOrder.map(function(filename) {
            return {
                filename: filename,
                masterNames: getMasterNames(filename) || [],
                active: activePlugins.includes(filename)
            }
        })
    };

    let storeLoadOrder = function() {
        $rootScope.loadOrder = getLoadOrder();
        loadOrderService.init($rootScope.loadOrder);
        appModeService.setAppMode();
    };

    let selectLoadOrder = function() {
        $scope.$emit('setTitle', 'zEdit - Selecting Load Order');
        $scope.$emit('openModal', 'loadOrder', { loadOrder: getLoadOrder() });
    };

    // scope functions
    $scope.checkHardcodedDat = function() {
        let game = profileService.getGame($scope.selectedProfile.gameMode);
        let fileName = game.shortName + '.Hardcoded.dat';
        if (fh.jetpack.exists(fileName)) return true;
        alert(`Error: Required file "${fileName}" not found, please re-install the application.`);
    };

    $scope.startSession = function () {
        if ($scope.selectedAppMode === 'clean' && !confirmCleanMode()) return;
        if (!$scope.checkHardcodedDat()) return;
        $rootScope.profile = $scope.selectedProfile;
        $rootScope.appMode = $scope.selectedAppMode;
        settingsService.loadProfileSettings($scope.selectedProfile.name);
        xelibService.startSession($scope.selectedProfile);
        $scope.$emit('sessionStarted', $scope.selectedProfile);
        appModeService.skipLoad() ? storeLoadOrder() : selectLoadOrder();
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
