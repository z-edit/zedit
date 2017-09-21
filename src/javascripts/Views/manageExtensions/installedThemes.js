ngapp.controller('installedThemes', function($scope, extensionService) {
    $scope.themes = extensionService.getInstalledThemes();

    // scope functions
    $scope.updateTheme = function(theme) {

    };

    $scope.applyTheme = function(theme) {

    };

    $scope.uninstallTheme = function(theme) {

    };

    $scope.updateAllThemes = function() {
        $scope.themes.filter(function(theme) {
            return theme.hasUpdate;
        }).forEach($scope.updateTheme);
    };

    $scope.installCustomTheme = function() {

    };
});
