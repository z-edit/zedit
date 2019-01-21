ngapp.directive('colorInput', function() {
    return {
        restrict: 'E',
        scope: {
            text: '=?',
            color: '=?',
            invalid: '=?',
            showOk: '=?',
            autoselect: '@'
        },
        templateUrl: 'directives/colorInput.html',
        controller: 'colorInputController'
    }
});

ngapp.controller('colorInputController', function($scope, hotkeyService) {
    let skip = false;

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
        if ($scope.invalid) return;
        skip = true;
        $scope.color = c.toHex();
    };

    $scope.$watch('color', function() {
        if (!$scope.color) return;
        let useHsl = $scope.text.startsWith('hsl'),
            c = tryParseColor($scope.color);
        $scope.invalid = !c;
        if ($scope.invalid) return;
        let rgb = c.toRGB();
        if (!skip) $scope.text = useHsl ? c.toHSL() : rgb;
        $scope.colorStyle = {'background-color': `${rgb}`};
        skip = false;
    });

    // event handlers
    $scope.handleEscape = () => $scope.$emit('handleEscape');
    $scope.handleEnter = () => $scope.$emit('handleEnter');

    // initialize color
    if ($scope.text) $scope.textChanged();
});
