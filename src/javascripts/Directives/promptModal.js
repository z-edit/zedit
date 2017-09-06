ngapp.controller('promptModalController', function($scope) {
    $scope.yes = function() {
        $scope.promptPromise.resolve(true);
        $scope.$emit('closeModal');
    };

    $scope.no = function() {
        $scope.promptPromise.resolve(false);
        $scope.$emit('closeModal');
    };
});
