ngapp.directive('colorSelector', function() {
    return {
        restrict: 'E',
        scope: {
            color: '=',
            key: '@'
        },
        templateUrl: 'directives/colorSelector.html',
        controller: 'colorSelectorController'
    }
});

ngapp.controller('colorSelectorController', function($scope, recentService) {
    recentService.store($scope.key, 15);
    $scope.recentColors = recentService.get($scope.key);

    $scope.setCustomColor = function({customColor}) {
        $scope.color = customColor;
        recentService.add($scope.key, $scope.color);
    };

    $scope.setColor = function(item) {
        $scope.$applyAsync(() => {
            $scope.color = item.color;
            recentService.add($scope.key, $scope.color);
        });
    };

    $scope.$watch('color', () => {
        if (!$scope.color) return;
        $scope.customColor = $scope.color.toHex();
    })
});
