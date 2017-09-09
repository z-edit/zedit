ngapp.directive('progressBar', function() {
    return {
        restrict: 'E',
        scope: {
            current: '=',
            max: '='
        },
        template:
            '<div class="progress" ng-style="progressStyle">\n' +
            '    {{percentProgress}}\n' +
            '</div>',
        controller: 'progressBarController'
    }
});

ngapp.controller('progressBarController', function($scope) {
    $scope.$watch('current', function() {
        $scope.percentProgress = ($scope.current / $scope.max).toPercentage();
        $scope.progressStyle = { width: $scope.percentProgress };
    });
});