ngapp.controller('mergeSaveModalController', function($scope, $timeout, saveModalInterface, mergeService) {
    // inherited functions
    saveModalInterface($scope);

    // helper functions
    let saveData = function() {
        let shouldFinalize = $scope.modalOptions.shouldFinalize;
        mergeService.saveMerges();
        shouldFinalize ? $scope.finalize() : $scope.$emit('closeModal');
    };

    // initialization
    $scope.saving = true;
    $scope.setMessage('Saving merge data');
    $timeout(saveData, 50);
});
