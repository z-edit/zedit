export default function(ngapp) {
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

    ngapp.controller('paneController', function ($scope, $element) {
        angular.inheritScope($scope, 'pane');
    });
}
