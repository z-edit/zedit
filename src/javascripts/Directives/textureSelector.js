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

ngapp.controller('textureSelectorController', function($scope, $timeout, recentService, resourceService) {
    recentService.store($scope.key, 10);
    $scope.recentTextures = recentService.get($scope.key);

    // scope functions
    $scope.textureSearch = function(text) {
        const texturesLength = 9;
        return resourceService.getFiles('textures')
            .filter(path => path.contains(text, true))
            .slice(0, 100)
            .map(path => path.slice(texturesLength));
    };

    $scope.setTexture = texture => $scope.texture = texture;

    $scope.setCustomTexture = function(texture) {
        $scope.$applyAsync(() => {
            $scope.texture = texture;
            recentService.add($scope.key, $scope.texture);
        });
    };
});
