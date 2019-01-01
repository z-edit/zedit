ngapp.directive('pluginGroup', function() {
    return {
        restrict: 'E',
        scope: {
            group: '='
        },
        templateUrl: 'directives/pluginGroup.html'
    }
});