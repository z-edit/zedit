export default function(ngapp, xelib) {
    ngapp.directive('recordTreeView', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/recordTreeView.html',
            controller: 'recordTreeViewController',
            scope: {
                data: '='
            }
        }
    });

    ngapp.controller('recordTreeViewController', function($scope, xelibService) {
        // TODO
    });
};