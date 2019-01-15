ngapp.directive('colorInput', function() {
    return {
        restrict: 'E',
        scope: {
            text: '=?',
            color: '=?',
            invalid: '=?',
            autoselect: '@'
        },
        templateUrl: 'directives/colorInput.html',
        controller: 'colorInputController'
    }
});

ngapp.controller('colorInputController', function($scope, hotkeyService) {
    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'colorInput');

    // helper functions
    let tryParseColor = function(color) {
        try { return new Color(color) } catch (e) {}
    };

    // scope functions
    $scope.textChanged = function() {
        let c = tryParseColor($scope.text);
        $scope.invalid = !c;
        if (!$scope.invalid) $scope.color = c.toHex();
    };

    $scope.$watch('color', function() {
        if (!$scope.color) return;
        let c = tryParseColor($scope.color);
        $scope.invalid = !c;
        $scope.text = c.toRGB();
        $scope.colorStyle = {'background-color': `${$scope.text}`};
    });

    // event handlers
    $scope.handleEscape = () => $scope.$emit('handleEscape');
    $scope.handleEnter = () => $scope.$emit('handleEnter');

    // initialize color
    if ($scope.text) $scope.textChanged();
});
