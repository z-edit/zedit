ngapp.directive('promptModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/promptModal.html',
        controller: 'promptModalController',
        scope: false
    }
});

ngapp.controller('promptModalController', function($scope) {
    $scope.yes = function() {
        $scope.promptPromise.resolve(true);
        $scope.togglePromptModal();
    };

    $scope.no = function() {
        $scope.promptPromise.resolve(false);
        $scope.togglePromptModal();
    };
});
