ngapp.directive('statusBar', function(spinnerFactory) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/statusBar.html',
        link: function(scope) {
            scope.spinnerOpts = spinnerFactory.tinyOptions;

            scope.$on('statusMessage', function(e, message) {
                scope.$applyAsync(() => scope.statusMessage = message);

            });

            scope.$on('toggleStatusBar', function(e, show) {
                scope.$applyAsync(() => {
                    scope.showStatusBar = show;
                    if (show) return;
                    scope.statusMessage = '';
                    scope.previewMessage = '';
                });
            });

            scope.$on('previewMessage', function(e, message) {
                scope.$applyAsync(() => scope.previewMessage = message);
            })
        }
    }
});
