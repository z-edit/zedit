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
        controller: 'dropdownController'
    }
});

ngapp.controller('dropdownController', function($scope, hotkeyService, hotkeyFactory) {
    $scope.showDropdown = false;

    // helper variables
    let hotkeys = hotkeyFactory.dropdownHotkeys();

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onDropdownKeyDown', hotkeys);

    // scope functions
    $scope.toggleDropdown = (visible) => $scope.showDropdown = visible;
    $scope.onDropdownBlur = () => $scope.showDropdown = false;

    // event handlers
    $scope.onItemClick = function(item) {
        $scope.callback(item);
        $scope.showDropdown = false;
    };
    $scope.onMouseOver = (index) => $scope.currentIndex = index;
});