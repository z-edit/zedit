ngapp.controller('editMergeModalController', function($scope, mergeService, mergeStatusService) {
    let pluginWarning = function() {
        let pluginsStr = $scope.merge.warningPlugins
            .reduce((str, filename) => str + `- ${filename}\n`, '');
        return confirm(`The following plugins will not be usable after building this merge.  You can include them in the merge or remove the plugins they require from the merge to resolve this.  Proceed anyways? \n\nPlugins:\n${pluginsStr}`);
    };

    // scope functions
    $scope.save = function() {
        if ($scope.merge.warningPlugins.length > 0 && !pluginWarning()) return;
        if (!$scope.editing) $scope.modalOptions.merges.push($scope.merge);
        mergeStatusService.updateStatus($scope.merge);
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
    $scope.experimental = env.allow_experimental_merge_methods;
});
