ngapp.directive('codeMirror', function($timeout, themeService, codeMirrorFactory) {
    return {
        restrict: 'A',
        require: '?ngModel',
        compile: function() {
            return function (scope, element, attrs, ngModel) {
                let options = codeMirrorFactory.getOptions(attrs.codeMirror || 'js'),
                    cm = CodeMirror.fromTextArea(element[0], options);

                // ng model data binding
                ngModel.$render = () => cm.setValue(ngModel.$viewValue || '');
                cm.on('change', function() {
                    let newValue = cm.getValue();
                    scope.$evalAsync(() => ngModel.$setViewValue(newValue));
                });

                // event handling
                scope.$on('refresh', () => $timeout(cm.refresh));
                scope.$on('syntaxThemeChanged', function(e, theme) {
                    let themeName = themeService.extractThemeName(theme, 'default');
                    cm.setOption('theme', themeName);
                    cm.refresh();
                });
            };
        }
    }
});
