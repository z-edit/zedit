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
    recentService.store($scope.key, 11);
    $scope.recentColors = recentService.get($scope.key);

    $scope.setColor = function(color) {
        $scope.$applyAsync(() => {
            if (typeof color === 'string')
                color = new Color(color);
            $scope.color = color;
            recentService.add($scope.key, $scope.color);
        });
    };

    $scope.$watch('color', () => {
        if (!$scope.color) return;
        $scope.customColorText = $scope.color.toRGB();
    });

    $scope.$watch('recentColors', () => {
        let numEntries = $scope.recentColors.length + 1;
        $scope.width = {
            1: '75',
            2: '150',
            3: '225',
            4: '150',
            5: '225'
        }[Math.min(numEntries, 5)];
    }, true);
});
