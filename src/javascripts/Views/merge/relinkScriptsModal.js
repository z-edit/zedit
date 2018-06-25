ngapp.controller('relinkScriptsModalController', function($scope, $timeout, relinker) {
    $scope.merges = $scope.modalOptions.merges.map(merge => ({
        disabled: merge.status !== 'Up to date',
        active: merge.status === 'Up to date',
        merge: merge
    }));

    $scope.relinkScripts = function() {
        let merges = $scope.merges.filterOnKey('active').mapOnKey('merge');
        $scope.$emit('closeModal');
        $timeout(() => relinker.relinkScripts(merges));
    };
});

