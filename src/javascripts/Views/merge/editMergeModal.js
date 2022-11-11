ngapp.controller('editMergeModalController', function($scope, mergeService, mergeStatusService, gameService) {
    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
    $scope.experimental = env.allow_experimental_merge_methods;
    let initialFilename = $scope.merge.filename;

    let getWarningString = function(warningPlugins) {
        return (warningPlugins.length > 6 ?
            warningPlugins.slice(0, 6).concat([
                `... (${warningPlugins.length - 6} more)`
            ]) : warningPlugins)
            .reduce((str, filename) => str + `- ${filename}\n`, '');
    };

    let pluginWarning = function() {
        let pluginsStr = getWarningString($scope.merge.warningPlugins);
        return confirm(`The following plugins will not be usable after building this merge.  You can include them in the merge or remove the plugins they require from the merge to resolve this.  Proceed anyways? \n\nPlugins:\n${pluginsStr}`);
    };

    // scope functions
    $scope.save = function() {
        let {warningPlugins} = $scope.merge;
        if (warningPlugins && warningPlugins.length > 0 && !pluginWarning()) return;
        if (!$scope.editing) $scope.modalOptions.merges.push($scope.merge);
        mergeStatusService.updateStatus($scope.merge);
        $scope.$emit('closeModal');
    };

    // event handlers
    $scope.$watch('merge.name', (newVal, oldVal) => {
        let baseName = $scope.merge.filename.slice(0, -4);
        if (newVal === oldVal || oldVal !== baseName) return;
        $scope.merge.filename = `${newVal}.esp`;
    });

    $scope.$watch('merge.filename', () => {
        if ($scope.merge.filename === initialFilename) return;
        let path = fh.path(gameService.dataPath, $scope.merge.filename);
        $scope.pluginExists = fh.jetpack.exists(path) === 'file';
    });
});
