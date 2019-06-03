ngapp.directive('dropdown', function(eventService) {
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
            custom: '@',
            callback: '=onItemClick',
            maxHeight: '=?',
            width: '=?'
        },
        templateUrl: 'directives/dropdown.html',
        controller: 'dropdownController',
        link: function(scope, element) {
            element[0].setAttribute('tabindex', '0');
            eventService.handleEvents(scope, element[0], {
                keydown: e => {
                    scope.$applyAsync(() => scope.onDropdownKeyDown(e));
                }
            });
        }
    }
});

ngapp.controller('dropdownController', function($scope, hotkeyInterface) {
    let lastHidden = new Date();

    // inherited functions
    hotkeyInterface($scope, 'onItemsKeyDown', 'dropdown');
    hotkeyInterface($scope, 'onDropdownKeyDown', 'dropdownItems');

    let updateItemsStyle = function() {
        $scope.itemsStyle = {};
        if (angular.isDefined($scope.maxHeight))
            $scope.itemsStyle.maxHeight = `${$scope.maxHeight}px`;
        if (angular.isDefined($scope.width))
            $scope.itemsStyle.width = `${$scope.width}px`;
    };

    // scope functions
    $scope.toggleDropdown = function() {
        let now = new Date();
        if (now - lastHidden < 500) return;
        $scope.showDropdown = !$scope.showDropdown;
        lastHidden = now;
        $scope.currentIndex = -1;
    };

    $scope.hideDropdown = function() {
        $scope.showDropdown = false;
        lastHidden = new Date();
    };

    $scope.selectItem = () => $scope.onItemClick($scope.items[$scope.currentIndex]);

    $scope.toggleCustom = () => {
        $scope.showDropdown = false;
        $scope.showCustom = !$scope.showCustom;
    };
    $scope.hideCustom = () => $scope.showCustom = false;

    $scope.selectCustom = function() {
        $scope.callback($scope.customItem);
        $scope.hideCustom();
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

    // event handlers
    $scope.$on('handleEnter', $scope.selectCustom);
    $scope.$on('handleEscape', $scope.hideCustom);

    $scope.$watch('maxHeight', function() {
        if (angular.isUndefined($scope.maxHeight)) return;
        updateItemsStyle();
    });

    $scope.$watch('width', function() {
        if (angular.isUndefined($scope.width)) return;
        updateItemsStyle();
    });
});
