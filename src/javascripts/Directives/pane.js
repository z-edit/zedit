ngapp.directive('pane', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/pane.html',
        controller: 'paneController',
        scope: {
            pane: '=?'
        }
    }
});

ngapp.controller('paneController', function ($scope, $element, viewFactory, hotkeyService) {
    Object.defaults($scope, $scope.pane || $scope.$parent.pane);

    // verbose logging
    if (verbose) logger.info(`Rendering pane #${$scope.id}`);

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

    let getCurrentTabIndex = function() {
        return $scope.tabs.findIndex(tab => tab.active);
    };

    let selectTab = function(index) {
        $scope.tabs.forEach((tab, i) => tab.active = i === index);
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

    $scope.closeCurrentTab = function() {
        $scope.closeTab(getCurrentTabIndex());
    };

    $scope.newTab = function() {
        let newTab = viewFactory.newView('newTabView', true);
        newTab.pane = $scope.pane;
        $scope.$applyAsync(() => {
            $scope.tabs.forEach(tab => tab.active = false);
            $scope.tabs.push(newTab);
        });
    };

    $scope.selectTab = function(e, index) {
        if (isCloseTab(e.target)) return;
        selectTab(index);
    };

    $scope.nextTab = function() {
        let newIndex = getCurrentTabIndex() + 1;
        if (newIndex >= $scope.tabs.length) newIndex = 0;
        selectTab(newIndex);
    };

    $scope.previousTab = function() {
        let newIndex = getCurrentTabIndex() - 1;
        if (newIndex < 0) newIndex = $scope.tabs.length - 1;
        selectTab(newIndex);
    };

    // event handling
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'pane');

    $scope.onWheel = function(e) {
        e.currentTarget.scrollLeft += e.deltaY > 0 ? 20 : -20;
    };

    $scope.$on('changeView', function(e, viewName) {
        let tabIndex = e.targetScope.$index,
            viewTab = viewFactory.newView(viewName, true);
        viewTab.pane = $scope.pane;
        $scope.tabs.splice(tabIndex, 1, viewTab);
        e.stopPropagation();
    });
});
