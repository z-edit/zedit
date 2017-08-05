export default function(ngapp) {
    ngapp.directive('mainTreeNode', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/mainTreeNode.html'
        }
    });
}