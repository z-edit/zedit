ngapp.controller('smashSaveModalController', function($scope, $timeout, saveModalService, patchService) {
    // inherited functions
    saveModalService.buildFunctions($scope);

    // helper functions
    let saveData = function() {
        let shouldFinalize = $scope.modalOptions.shouldFinalize;
        patchService.savePatches();
        shouldFinalize ? $scope.finalize() : $scope.$emit('closeModal');
    };

    // initialization
    $scope.saving = true;
    $scope.setMessage('Saving patch data');
    $timeout(saveData, 50);
});
