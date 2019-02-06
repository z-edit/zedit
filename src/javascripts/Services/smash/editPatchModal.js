ngapp.controller('editPatchModalController', function($scope, patchService, patchStatusService, gameService) {
    $scope.editing = $scope.modalOptions.hasOwnProperty('patch');
    $scope.patch = $scope.modalOptions.patch || patchService.newPatch();
    let initialFilename = $scope.patch.filename;

    // scope functions
    $scope.save = function() {
        let {warningPlugins} = $scope.patch;
        if (warningPlugins && warningPlugins.length > 0 && !pluginWarning()) return;
        if (!$scope.editing) $scope.modalOptions.patchs.push($scope.patch);
        patchStatusService.updateStatus($scope.patch);
        $scope.$emit('closeModal');
    };

    // event handlers
    $scope.$watch('patch.name', (newVal, oldVal) => {
        let baseName = $scope.patch.filename.slice(0, -4);
        if (oldVal !== baseName) return;
        $scope.patch.filename = `${newVal}.esp`;
    });

    $scope.$watch('patch.filename', () => {
        if ($scope.patch.filename === initialFilename) return;
        let path = fh.path(gameService.dataPath, $scope.patch.filename);
        $scope.pluginExists = fh.jetpack.exists(path) === 'file';
    });

    $scope.$watch('patch.patchType', () => {
        let useExclusions = $scope.patch.patchType === 'Full load order',
            key = useExclusions ? 'pluginExclusions' : 'pluginInclusions',
            delKey = useExclusions ? 'pluginInclusions' : 'pluginExclusions';
        if ($scope.patch.hasOwnProperty(key)) return;
        delete $scope.patch[delKey];
        $scope.patch[key] = [];
    });
});