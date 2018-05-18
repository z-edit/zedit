ngapp.directive('progressBar', function() {
    return {
        restrict: 'E',
        scope: {
            progress: '='
        },
        template:
            '<div class="progress" ng-class="{\'complete\' : progress.complete, \'error\' : progress.error}" ng-style="progressStyle"></div>' +
            '<div class="progress-label">{{percentProgress}}</div>',
        controller: 'progressBarController'
    }
});

ngapp.controller('progressBarController', function($scope) {
    let p = $scope.progress;
    $scope.$watch('progress.current', function() {
        $scope.percentProgress = (p.current / p.max).toPercentage();
        $scope.progressStyle = { width: $scope.percentProgress };
    });
});
