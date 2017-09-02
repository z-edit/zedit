ngapp.directive('loadOrderModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/loadOrderModal.html',
        controller: 'loadOrderModalController',
        scope: false
    }
});

ngapp.controller('loadOrderModalController', function ($scope, $state, $element) {
    // scope functions
    $scope.updateIndexes = function() {
        let n = 0;
        $scope.loadOrder.forEach(function(item) {
            if (item.active) item.index = n++;
        });
    };

    $scope.loadPlugins = function() {
        let loadOrder = $scope.loadOrder.filter(function (item) {
            return item.active;
        }).map(function (item) {
            return item.filename;
        });
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        $state.go('base.main');
    };

    // event handlers
    $scope.$on('itemsChanged', function(e) {
        $scope.updateIndexes();
        e.stopPropagation();
    });

    // initialize view model properties
    $scope.updateIndexes();

    // focus modal
    let modalContainer = $element[0].firstElementChild,
        modalElement = modalContainer.firstElementChild;
    modalElement.focus();
});
