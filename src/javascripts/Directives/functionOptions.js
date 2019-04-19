ngapp.directive('functionOptions', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/functionOptions.html',
        scope: {
            options: '='
        },
        replace: true
    }
});
