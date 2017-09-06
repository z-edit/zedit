ngapp.controller('coreSettingsController', function($scope, themeService) {
    // initialization
    $scope.themes = themeService.getThemes();
    $scope.theme = $scope.themes.find(function(theme) {
        return theme.filename === $scope.globalSettings.theme;
    });

    // scope functions
    $scope.themeChanged = function() {
        $scope.globalSettings.theme = $scope.theme.filename;
        $scope.$emit('setTheme', $scope.theme.filename);
    };
});