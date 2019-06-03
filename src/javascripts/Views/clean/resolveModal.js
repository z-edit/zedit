ngapp.controller('resolveModalController', function ($scope, errorTypeFactory, pluginErrorService, hotkeyInterface) {
    // HELPER FUNCTIONS
    let prepareResolutions = function() {
        $scope.resolutions = pluginErrorService.getResolutions($scope.error);
        $scope.selectedIndex = $scope.resolutions.indexOf($scope.error.resolution);
    };

    let setError = function() {
        if ($scope.errorIndex >= $scope.errorsToResolve.length) {
            $scope.$emit('closeModal');
            return;
        }
        $scope.error = $scope.errorsToResolve[$scope.errorIndex];
        $scope.group = $scope.errorGroups[$scope.error.group];
        prepareResolutions();
    };

    // SCOPE FUNCTIONS
    $scope.selectResolution = function(resolution) {
        $scope.error.resolution = resolution;
        $scope.nextError();
    };

    $scope.nextError = function() {
        $scope.errorIndex++;
        setError();
    };

    $scope.previousError = function() {
        if ($scope.errorIndex === 0) return;
        $scope.errorIndex--;
        setError();
    };

    $scope.handleResolutionKey = function(e) {
        let n = e.keyCode - 49; // 49 -> keycode for 1
        if (n >= 0 && n < $scope.resolutions.length) {
            $scope.selectResolution($scope.resolutions[n]);
        }
    };

    // SET UP HOTKEYS
    hotkeyInterface($scope, 'onKeyDown', 'resolveModal');

    // INITIALIZATION
    $scope.errorsToResolve = $scope.modalOptions.errors;
    $scope.errorGroups = errorTypeFactory.errorTypes();
    $scope.errorIndex = 0;
    setError();
});
