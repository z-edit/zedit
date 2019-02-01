ngapp.directive('dropdown', function() {
    return {
        restrict: 'E',
        transclude: {
            display: 'dropdownDisplay',
            item: 'dropdownItem'
        },
        scope: {
            items: '=',
            callback: '=onItemClick',
            maxHeight: '=?',
            width: '=?'
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
    let lastHidden = new Date();

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onItemsKeyDown', 'dropdown');
    hotkeyService.buildOnKeyDown($scope, 'onDropdownKeyDown', 'dropdownItems');

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

    $scope.selectItem = function() {
        $scope.onItemClick($scope.items[$scope.currentIndex]);
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
    $scope.$watch('maxHeight', function() {
        if (angular.isUndefined($scope.maxHeight)) return;
        updateItemsStyle();
    });

    $scope.$watch('width', function() {
        if (angular.isUndefined($scope.width)) return;
        updateItemsStyle();
    });
});
