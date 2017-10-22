ngapp.controller('resolveModalDocumentationController', function($scope, errorTypeFactory, errorResolutionFactory) {
    $scope.errorTypes = errorTypeFactory.errorTypes();
    $scope.resolutions = errorResolutionFactory.errorResolutions;
});