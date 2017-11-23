ngapp.controller('editMergeModalController', function($scope, mergeService, modalService, tabsFactory) {
    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
    $scope.tabs = tabsFactory.editMergeModalTabs;

    // scope functions
    $scope.createMerge = function() {
        $scope.modalOptions.merges.push($scope.merge);
        $scope.$emit('closeModal');
    };
});
