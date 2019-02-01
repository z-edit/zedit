ngapp.directive('dropover', function() {
    return {
        restrict: 'E',
        transclude: {
            display: 'display',
            drop: 'drop'
        },
        scope: {
            callback: '='
        },
        templateUrl: 'directives/dropover.html',
        controller: 'dropoverController',
        link: function(scope, element) {
            element[0].setAttribute('tabindex', '0');
            element[0].addEventListener('keydown', function(e) {
                scope.$applyAsync(() => scope.onDropoverKeyDown(e));
            });
        }
    }
});

ngapp.controller('dropoverController', function($scope, hotkeyService) {
    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onDropoverKeyDown', 'dropover');

    // scope functions
    $scope.toggleDropover = function() {
        $scope.showDropover = !$scope.showDropover;
    };

    $scope.hideDropover = function() {
        $scope.showDropover = false;
    };

    $scope.select = function() {
        $scope.callback($scope.customItem);
        $scope.hideDropover();
    };

    // event handlers
    $scope.$on('handleEnter', $scope.select);
    $scope.$on('handleEscape', $scope.hideDropover);
    $scope.$on('hideDropover', $scope.hideDropover);
});
