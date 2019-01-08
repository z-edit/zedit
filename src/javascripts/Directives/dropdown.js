ngapp.directive('dropdown', function() {
    return {
        restrict: 'E',
        transclude: {
            display: 'dropdownDisplay',
            item: 'dropdownItem',
            customItem: '?customItem',
            customSelect: '?customSelect',
        },
        scope: {
            items: '=',
            applyCustom: '=?',
            callback: '=onItemClick',
            maxHeight: '=?'
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
    $scope.allowCustom = angular.isDefined($scope.applyCustom);

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onItemsKeyDown', 'dropdown');
    hotkeyService.buildOnKeyDown($scope, 'onDropdownKeyDown', 'dropdownItems');
    hotkeyService.buildOnKeyDown($scope, 'onCustomKeyDown', 'dropdownCustom');

    // scope functions
    $scope.toggleDropdown = function() {
        $scope.showDropdown = !$scope.showDropdown;
        $scope.currentIndex = -1;
    };
    $scope.hideDropdown = () => $scope.showDropdown = false;
    $scope.selectItem = () => $scope.onItemClick($scope.items[$scope.currentIndex]);

    $scope.toggleCustom = () => $scope.showCustom = !$scope.showCustom;
    $scope.hideCustom = () => $scope.showCustom = false;

    $scope.selectCustom = function() {
        $scope.applyCustom($scope);
        $scope.showCustom = false;
    };

    $scope.handleUpArrow = function() {
        $scope.currentIndex--;
        if ($scope.currentIndex < 0) $scope.currentIndex = $scope.items.length - 1;
    };

    $scope.handleDownArrow = function() {
        $scope.currentIndex++;
        if ($scope.currentIndex >= $scope.items.length) $scope.currentIndex = 0;
    };

    // event handlers
    $scope.onMouseOver = index => $scope.currentIndex = index;

    $scope.onItemClick = function(item) {
        if (item) $scope.callback(item);
        $scope.showDropdown = false;
    };

    $scope.$watch('maxHeight', function() {
        if (angular.isUndefined($scope.maxHeight)) return;
        $scope.itemsStyle = { maxHeight: `${$scope.maxHeight}px` };
    });
});
