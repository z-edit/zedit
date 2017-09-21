ngapp.controller('installedModules', function($scope, extensionService) {
    $scope.modules = extensionService.getInstalledModules();

    // scope functions
    $scope.updateModule = function(module) {

    };

    $scope.applyModule = function(module) {

    };

    $scope.uninstallModule = function(module) {

    };

    $scope.updateAllModules = function() {
        $scope.modules.filter(function(module) {
            return module.hasUpdate;
        }).forEach($scope.updateModule);
    };

    $scope.installCustomModule = function() {

    };
});
