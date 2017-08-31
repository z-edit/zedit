ngapp.directive('codeMirror', function($timeout, codeMirrorFactory) {
    return {
        restrict: 'A',
        scope: {
            data: '=',
            refresh: '=ngRefresh'
        },
        link: function(scope, element, attrs) {
            let options = codeMirrorFactory.getOptions(attrs.codeMirror || 'js'),
                cm = CodeMirror.fromTextArea(element[0], options);

            // two-way data binding to and from editor
            scope.$watch('data', function(newVal){
                if (scope.skip) {
                    scope.skip = false;
                    return;
                }
                if (typeof newVal === "string") cm.setValue(newVal);
            });

            cm.on('change', function() {
                scope.skip = true;
                scope.data = cm.getValue();
            });

            scope.$watch('refresh', function(newVal) {
                if (!newVal) return; // Skip undefined or false variables
                $timeout(() => cm.refresh());
            });
        }
    }
});