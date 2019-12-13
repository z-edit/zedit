ngapp.factory('themeInterface', function($timeout, themeService) {
    return function(scope) {
        let themeStylesheet = document.getElementById('theme'),
            syntaxThemeStylesheet = document.getElementById('syntaxTheme');

        // event listeners
        scope.$on('setTheme', (e, theme) => scope.theme = theme);
        scope.$on('setSyntaxTheme', (e, theme) => scope.syntaxTheme = theme);

        scope.$watch('theme', function() {
            let themeFilePath = fh.jetpack.path(`themes/${scope.theme}`);
            themeStylesheet.href = themeFilePath;
            scope.$broadcast('themeChanged', scope.theme);
            $timeout(() => ipcRenderer.send('set-theme', themeFilePath), 1000);
        });

        scope.$watch('syntaxTheme', function() {
            if (scope.syntaxTheme === '') {
                syntaxThemeStylesheet.href = '';
            } else {
                let syntaxThemePath = `syntaxThemes/${scope.syntaxTheme}`;
                syntaxThemeStylesheet.href = fh.jetpack.path(syntaxThemePath);
            }
            scope.$broadcast('syntaxThemeChanged', scope.syntaxTheme);
        });

        // initialization
        scope.theme = themeService.getCurrentTheme();
        scope.syntaxTheme = themeService.getCurrentSyntaxTheme();
    }
});
