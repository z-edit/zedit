ngapp.directive('referenceSelect', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            signature: '=?',
            signatures: '=?',
            handle: '=?'
        },
        templateUrl: 'directives/referenceSelect.html',
        controller: 'referenceSelectController'
    }
});

ngapp.controller('referenceSelectController', function($scope) {
    // default values
    if (angular.isUndefined($scope.signatures))
        $scope.signatures = Object.keys(xelib.GetSignatureNameMap()).sort();
    if (angular.isUndefined($scope.signature))
        $scope.signature = $scope.signatures[0];

    // scope functions
    $scope.referenceSearch = function(str) {
        let search = xelib.FindValidReferences;
        return search($scope.handle || 0, $scope.signature, str, 10);
    };

    $scope.setCustomResult = (str) => $scope.model = str;
});
