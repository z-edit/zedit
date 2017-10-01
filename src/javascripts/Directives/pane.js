ngapp.directive('pane', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/pane.html',
        controller: 'paneController',
        scope: {
            pane: "=?"
        }
    }
});

ngapp.controller('paneController', function ($scope, $element, viewFactory) {
    angular.inheritScope($scope, 'pane');

    // initialize pane size
    let paneElement = $element[0],
        container = paneElement.parentElement,
        parentVertical = container.classList.contains('vertical'),
        dimension = parentVertical ? 'height' : 'width';
    paneElement.style[dimension] = $scope[dimension];

    // helper functions
    let isCloseTab = function(element) {
        let closeTabClasses = ['add-tab', 'fa fa-times'];
        return element && closeTabClasses.includes(element.className);
    };

    // scope functions
    $scope.closeTab = function(index) {
        let closedTab = $scope.tabs.splice(index, 1)[0];
        closedTab.destroy(closedTab);
        if (closedTab.active) {
            let nextTab = $scope.tabs[index] || $scope.tabs[index - 1];
            if (nextTab) {
                nextTab.active = true;
            } else {
                $scope.$emit('removePane');
            }
        }
    };

    $scope.newTab = function() {
        let newTab = viewFactory.newView('newTabView', true);
        $scope.$applyAsync(function() {
            $scope.tabs.forEach((tab) => tab.active = false);
            $scope.tabs.push(newTab);
        });
    };

    $scope.selectTab = function(e, index) {
        if (isCloseTab(e.srcElement)) return;
        $scope.tabs.forEach((tab, i) => tab.active = i === index);
    };

    $scope.$on('changeView', function(e, viewName) {
        let tabIndex = e.targetScope.$index,
            viewTab = viewFactory.newView(viewName, true);
        $scope.tabs.splice(tabIndex, 1, viewTab);
        e.stopPropagation();
    });
});
