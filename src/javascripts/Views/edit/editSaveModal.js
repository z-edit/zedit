ngapp.controller('editSaveModalController', function($scope, $timeout, saveModalService) {
    // inherited functions
    saveModalService.buildFunctions($scope);

    // helper functions
    let saveData = function() {
        $scope.total = $scope.pluginsToSave.length;
        if ($scope.total > 0) $scope.savePlugins();
        shouldFinalize ? $scope.finalize() : $scope.$emit('closeModal');
    };

    // scope functions
    $scope.save = function() {
        $scope.saving = true;
        $scope.pluginsToSave = $scope.getActivePlugins();
        $timeout(saveData, 50);
    };

    $scope.discard = function() {
        $scope.saving = true;
        $scope.pluginsToSave = [];
        $timeout(saveData, 50);
    };

    // initialization
    let shouldFinalize = $scope.modalOptions.shouldFinalize;
    $scope.pluginsToProcess = $scope.modalOptions.plugins;
    $scope.saving = false;
    $scope.message = 'Closing';

    // skip user interaction if there are no plugins to save
    if ($scope.pluginsToProcess.length === 0) $scope.discard();
});
