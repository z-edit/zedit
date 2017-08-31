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

ngapp.controller('dropdownController', function($scope, htmlHelpers) {
    $scope.showDropdown = false;

    // helper functions
    let onDocumentClick = function(e) {
        let parentDropdown = htmlHelpers.findParent(e.srcElement, function(element) {
            return element.tagName === 'DROPDOWN';
        });
        if (parentDropdown) return;
        $scope.$applyAsync(() => $scope.toggleDropdown(false));
    };

    // scope functions
    $scope.toggleDropdown = function(visible) {
        if ($scope.showDropdown == visible) return;
        $scope.showDropdown = visible;
        let functionName = (visible ? 'add' : 'remove') + 'EventListener';
        document[functionName]('click', onDocumentClick);
    };

    // event handlers
    $scope.onItemClick = (item) => $scope.callback(item);
    $scope.onMouseEnter = (item) => item.selected = true;
    $scope.onMouseLeave = (item) => item.selected = false;
    $scope.$on('destroy', () => $scope.toggleDropdown(false));
});