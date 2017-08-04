export default function(ngapp, xelib) {
    ngapp.directive('loadOrderModal', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/loadOrderModal.html',
            controller: 'loadOrderModalController',
            scope: false
        }
    });

    ngapp.controller('loadOrderModalController', function ($scope, $state, $element, listViewFactory) {
        $scope.prevIndex = undefined;

        // inherited functions
        listViewFactory.build($scope, 'loadOrder', 'loadPlugins');

        // scope functions
        $scope.updateIndexes = function() {
            var n = 0;
            $scope.loadOrder.forEach(function(item) {
                if (item.active) item.index = n++;
            });
        };

        $scope.loadPlugins = function() {
            var loadOrder = $scope.loadOrder.filter(function (item) {
                return item.active;
            }).map(function (item) {
                return item.filename;
            });
            console.log("Loading: \n" + loadOrder);
            xelib.ClearMessages();
            xelib.LoadPlugins(loadOrder.join('\n'));
            $state.go('base.main');
        };

        // initialize view model properties
        $scope.updateIndexes();
        $scope.clearSelection();

        // focus modal
        var modalElement = $element[0].firstElementChild.firstElementChild;
        modalElement.focus();
    });
}
