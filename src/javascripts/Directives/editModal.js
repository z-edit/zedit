ngapp.controller('editModalController', function($scope, modalService) {
    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.applyValue = function() {
        if ($scope.invalid) return;
        $scope.modalOptions.callback($scope.value);
        $scope.$emit('closeModal');
    };

    $scope.validate = function() {
        $scope.valid = $scope.modalOptions.isValid($scope.value);
    };

    // initialization
    $scope.value = $scope.modalOptions.initialValue;
    $scope.validate();
});
