ngapp.directive('codeMirror', function($timeout, codeMirrorFactory) {
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

                // refresh on event
                scope.$on('refresh', () => $timeout(cm.refresh));
            };
        }
    }
});