ngapp.controller('coreSettingsController', function($scope, themeService) {
    // initialization
    $scope.themes = themeService.getThemes();
    $scope.syntaxThemes = themeService.getSyntaxThemes();
    $scope.theme = $scope.themes.find(function(theme) {
        return theme.filename === $scope.globalSettings.theme;
    });
    $scope.syntaxTheme = $scope.syntaxThemes.find(function(theme) {
        return theme.filename === $scope.globalSettings.syntaxTheme;
    }) || '';
    $scope.sampleCode = [
        'function foo(bar) {',
        '    if (bar == 1) {',
        '        return "Foobar";',
        '    } else if (bar > 1) {',
        '        return false;',
        '    } else {',
        '        return foo(bar + 1);',
        '    }',
        '}'
    ].join('\r\n');

    // helper functions
    let setSyntaxTheme = function(name) {
        let syntaxTheme = $scope.syntaxThemes.find(function(theme) {
            return theme.name === name;
        });
        if (name === '' || syntaxTheme) {
            $scope.syntaxTheme = syntaxTheme;
            $scope.syntaxThemeChanged();
        } else {
            console.log(`Couldn't find preferred syntax theme ${theme}`);
        }
    };

    // scope functions
    $scope.themeChanged = function() {
        $scope.globalSettings.theme = $scope.theme.filename;
        setSyntaxTheme($scope.theme.syntaxTheme);
        $scope.$emit('setTheme', $scope.theme.filename);
    };

    $scope.syntaxThemeChanged = function() {
        let syntaxTheme = $scope.syntaxTheme && $scope.syntaxTheme.filename;
        $scope.globalSettings.syntaxTheme = syntaxTheme || '';
        $scope.$emit('setSyntaxTheme', syntaxTheme || '');
    };
});
