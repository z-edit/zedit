ngapp.directive('dropdown', function() {
    return {
        restrict: 'E',
        transclude: {
            display: 'dropdownDisplay',
            item: 'dropdownItem'
        },
        scope: {
            items: '=',
            callback: '=onItemClick'
        },
        templateUrl: 'directives/dropdown.html',
        controller: 'dropdownController',
        link: function(scope, element) {
            element[0].setAttribute('tabindex', '0');
            element[0].addEventListener('keydown', function(e) {
                scope.$applyAsync(() => scope.onDropdownKeyDown(e));
            });
        }
    }
});

ngapp.controller('dropdownController', function($scope, hotkeyService) {
    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onItemsKeyDown', 'dropdown');
    hotkeyService.buildOnKeyDown($scope, 'onDropdownKeyDown', 'dropdownItems');

    // scope functions
    $scope.toggleDropdown = function() {
        $scope.showDropdown = !$scope.showDropdown;
        $scope.currentIndex = -1;
    };
    $scope.onDropdownBlur = () => $scope.showDropdown = false;
    $scope.handleEscape = () => $scope.showDropdown = false;
    $scope.handleEnter = () => $scope.onItemClick($scope.items[$scope.currentIndex]);

    $scope.handleUpArrow = function() {
        $scope.currentIndex--;
        if ($scope.currentIndex < 0) $scope.currentIndex = $scope.items.length - 1;
    };

    $scope.handleDownArrow = function() {
        $scope.currentIndex++;
        if ($scope.currentIndex >= $scope.items.length) $scope.currentIndex = 0;
    };

    // event handlers
    $scope.onItemClick = function(item) {
        if (item) $scope.callback(item);
        $scope.showDropdown = false;
    };
    $scope.onMouseOver = (index) => $scope.currentIndex = index;
});
