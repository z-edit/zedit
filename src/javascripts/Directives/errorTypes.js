ngapp.directive('errorTypes', function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/errorTypes.html',
        link: function(scope, errorTypeFactory, errorResolutionFactory) {
            scope.errorTypes = errorTypeFactory.errorTypes();
            scope.errorResolutions = errorResolutionFactory.errorResolutions;
        }
    }
});