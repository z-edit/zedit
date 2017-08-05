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

        // helper variables
        let paneElement = $element[0];
        let container = paneElement.parentElement;
        let parentVertical = container.classList.contains('vertical');
        let dimension = parentVertical ? 'height' : 'width';

        // initialize pane size
        paneElement.style[dimension] = $scope[dimension];
    });
}