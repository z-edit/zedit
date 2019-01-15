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

    $scope.setCustomTexture = function({customColor}) {
        $scope.color = customColor;
        recentService.add($scope.key, $scope.color);
    };

    $scope.setColor = function(item) {
        $scope.color = item.color;
        recentService.add($scope.key, $scope.color);
    };
});
