ngapp.directive('editModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/editModal.html',
        controller: 'editModalController',
        scope: false
    }
});

ngapp.controller('editModalController', function($scope, formUtils) {
    // scope functions
    $scope.applyValue = function() {
        if ($scope.invalid) return;
        $scope.editOptions.callback($scope.value);
        $scope.toggleEditModal();
    };

    $scope.validate = function() {
        $scope.valid = $scope.editOptions.isValid($scope.value);
    };

    // initialization
    $scope.value = $scope.editOptions.initialValue;
    $scope.validate();

    // inherited functions
    $scope.unfocusEditModal = formUtils.unfocusModal($scope.toggleEditModal);
});
