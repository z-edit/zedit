ngapp.directive('colorSelector', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        templateUrl: 'directives/colorSelector.html',
        controller: 'colorSelectorController'
    }
});

ngapp.controller('colorSelectorController', function($scope) {
    $scope.selectColor = function(color) {
        $scope.$applyAsync(() => {
            color = new Color(color);
            $scope.color.copyRGB(color);
        });
    };

    $scope.$watch('color', () => {
        if (!$scope.color) return;
        $scope.customColorText = $scope.color.toRGB();
    }, true);
});
