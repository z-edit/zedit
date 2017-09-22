ngapp.controller('installedThemesController', function($scope, extensionService) {
    $scope.themes = extensionService.getInstalledThemes();

    // scope functions
    $scope.applyTheme = function(theme) {
        $scope.themes.forEach((theme) => theme.applied = false);
        theme.applied = true;
        $scope.$emit('setTheme', theme.filename);
    };

    $scope.uninstallTheme = function(theme) {
        if (theme.applied) {
            let otherTheme = $scope.themes.find((t) => { return t !== theme});
            $scope.applyTheme(otherTheme);
        }
        fs.jetpack.remove(`themes\\${theme.filename}`);
        $scope.themes.remove(theme);
    };

    $scope.installTheme = function() {
        let themeFile = fh.selectFile('Select a theme archive or css file.', '', [
            { name: 'ZIP Archive', extensions: ['zip'] },
            { name: 'CSS File', extensions: ['css'] }
        ]);
        if (!themeFile) return;
        try {
            extensionService.installTheme(themeFile);
            $scope.themes = extensionService.getInstalledThemes(true);
        } catch (x) {
            alert(`Error installing theme:\r\n${x.stack}`);
        }
    };
});
