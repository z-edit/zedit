ngapp.directive('statusBar', function(spinnerFactory) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/statusBar.html',
        link: function(scope) {
            scope.spinnerOpts = spinnerFactory.tinyOptions;

            scope.$on('buildReferences', function(e, filename) {
                scope.showStatusBar = true;
                scope.statusMessage = `Building references for ${filename}...`;
            });

            scope.$on('referencesBuilt', function() {
                scope.showStatusBar = false;
            });

            scope.$on('preview', function(e, message) {
                scope.previewMessage = message;
            })
        }
    }
});
