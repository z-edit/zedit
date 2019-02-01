ngapp.directive('textureSelector', function() {
    return {
        restrict: 'E',
        scope: {
            texture: '=',
            key: '@'
        },
        templateUrl: 'directives/textureSelector.html',
        controller: 'textureSelectorController'
    }
});

ngapp.controller('textureSelectorController', function($scope) {
    $scope.setTexture = function(texture) {
        $scope.$applyAsync(() => {
            $scope.texture = texture;
        });
    };

    $scope.selectAsset = function(asset) {
        $scope.setTexture(asset.path);
    };

    $scope.doubleClickAsset = function(asset) {
        $scope.setTexture(asset.path);
        $scope.$broadcast('hideDropover');
    };
});
