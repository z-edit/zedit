ngapp.directive('colorInput', function() {
    return {
        restrict: 'E',
        scope: {
            text: '=?',
            color: '=?',
            invalid: '=?'
        },
        templateUrl: 'directives/colorInput.html',
        controller: 'colorInputController'
    }
});

ngapp.controller('colorInputController', function($scope) {
    let tryParseColor = function(color) {
        try { return new Color(color) } catch (e) {}
    };

    $scope.textChanged = function() {
        let c = tryParseColor($scope.text);
        $scope.invalid = !c;
        if (!$scope.invalid) $scope.color = c.toHex();
    };

    $scope.$watch('color', function() {
        let c = new Color($scope.color);
        $scope.text = c.toRGB();
        $scope.colorStyle = {'background-color': `${$scope.text}`};
    });

    // initialize color
    $scope.textChanged();
});
