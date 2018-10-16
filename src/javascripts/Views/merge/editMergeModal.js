ngapp.controller('editMergeModalController', function($scope, mergeService, mergeStatusService) {
    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
    $scope.experimental = env.allow_experimental_merge_methods;
    let initialFilename = $scope.merge.filename;
    let dataPath = xelib.GetGlobal('DataPath');

    // scope functions
    $scope.save = function() {
        if (!$scope.editing) $scope.modalOptions.merges.push($scope.merge);
        mergeStatusService.updateStatus($scope.merge);
        $scope.$emit('closeModal');
    };

    // event handlers
    $scope.$watch('merge.name', (newVal, oldVal) => {
        let baseName = $scope.merge.filename.slice(0, -4);
        if (oldVal !== baseName) return;
        $scope.merge.filename = `${newVal}.esp`;
    });

    $scope.$watch('merge.filename', () => {
        if ($scope.merge.filename === initialFilename) return;
        let path = `${dataPath}\\${$scope.merge.filename}`;
        $scope.pluginExists = fh.jetpack.exists(path) === 'file';
    });
});