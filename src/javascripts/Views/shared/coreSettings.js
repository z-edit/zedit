ngapp.controller('coreSettingsController', function($scope, themeService) {
    // initialization
    $scope.themes = themeService.getThemes();
    $scope.syntaxThemes = themeService.getSyntaxThemes();
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
    let getTheme = function(name) {
        return $scope.themes.findByKey('filename', name);
    };

    let getSyntaxTheme = function(name) {
        return $scope.syntaxThemes.findByKey('filename', name);
    };

    let setSyntaxTheme = function(name) {
        let syntaxTheme = getSyntaxTheme(name);
        if (name === '' || syntaxTheme) {
            $scope.syntaxTheme = syntaxTheme;
            $scope.syntaxThemeChanged();
        } else {
            console.log(`Couldn't find preferred syntax theme ${name}`);
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

    // initialization
    let {theme, syntaxTheme} = $scope.globalSettings;
    $scope.theme = getTheme(theme);
    $scope.syntaxTheme = getSyntaxTheme(syntaxTheme) || '';
});
