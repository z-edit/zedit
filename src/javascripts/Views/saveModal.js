ngapp.controller('saveModalController', function($scope, $timeout, errorService) {
    // initialization
    let shouldFinalize = $scope.modalOptions.shouldFinalize;
    $scope.saving = false;
    $scope.message = 'Closing';
    $scope.pluginsToProcess = xelib.GetElements().filter(function(handle) {
        return xelib.GetIsModified(handle);
    }).map(function(handle) {
        return {
            handle: handle,
            filename: xelib.Name(handle),
            active: true
        }
    });

    // helper functions
    let setMessage = function(message, detailedMessage = '') {
        $scope.$applyAsync(() => {
            $scope.message = message;
            $scope.detailedMessage = detailedMessage;
        });
    };

    let savePlugins = function() {
        setMessage('Saving plugins');
        $scope.pluginsToSave.forEach(function(plugin, index) {
            $scope.detailedMessage = `${plugin.filename} (${index}/${$scope.total})`;
            errorService.try(() => xelib.SaveFile(plugin.handle));
        });
    };

    let finalize = function() {
        setMessage('Finalizing xEditLib');
        xelib.Finalize();
        $scope.$emit('terminate');
    };

    let saveData = function() {
        $scope.total = $scope.pluginsToSave.length;
        if ($scope.total > 0) savePlugins();
        shouldFinalize ? finalize() : $scope.$emit('closeModal');
    };

    let getActivePlugins=  function() {
        return $scope.pluginsToProcess.filter(function(plugin) {
            return plugin.active;
        });
    };

    // scope functions
    $scope.save = function() {
        $scope.saving = true;
        $scope.pluginsToSave = getActivePlugins();
        $timeout(saveData, 50);
    };

    $scope.discard = function() {
        $scope.saving = true;
        $scope.pluginsToSave = [];
        $timeout(saveData, 50);
    };

    // skip user interaction if there are no plugins to save
    if ($scope.pluginsToProcess.length === 0) $scope.discard();
});
