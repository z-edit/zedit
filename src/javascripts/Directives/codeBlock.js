ngapp.directive('codeBlock', function(themeService, codeMirrorFactory) {
    return {
        restrict: 'E',
        scope: {
            basePath: '@',
            path: '@'
        },
        template: '<textarea></textarea>',
        link: function(scope, element) {
            // load code
            let basePath = scope.basePath || 'app/docs/development/apis',
                path = `${basePath}/${scope.path}`,
                code = fh.loadTextFile(path).trimRight();

            // attach code mirror
            let language = fh.getFileExt(scope.path),
                options = codeMirrorFactory.getOptions(language, true),
                textArea = element[0].firstElementChild,
                cm = CodeMirror.fromTextArea(textArea, options);
            cm.setValue(code);

            // event handling
            scope.$on('syntaxThemeChanged', function(e, theme) {
                let themeName = themeService.extractThemeName(theme, 'default');
                cm.setOption('theme', themeName);
                cm.refresh();
            });
        }
    }
});
