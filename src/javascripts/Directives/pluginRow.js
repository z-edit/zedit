ngapp.directive('pluginRow', function() {
    return {
        restrict: 'E',
        scope: {
            plugin: '='
        },
        templateUrl: 'directives/pluginRow.html'
    }
});