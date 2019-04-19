ngapp.controller('addMastersModalController', function($scope, $timeout, errorService) {
    // initialization
    let selectedFile = $scope.modalOptions.handle,
        availableMasters = xelib.GetAvailableMasters(selectedFile);
    $scope.filename = xelib.Name(selectedFile);
    $scope.availableMasters = availableMasters.map(master => ({
        name: master,
        active: false
    }));

    // scope functions
    $scope.applyValue = function() {
        errorService.try(() => {
            $scope.availableMasters.forEach(master => {
                if (!master.active) return;
                xelib.AddMaster(selectedFile, master.name);
            });
        });
        $scope.afterApplyValue();
    };

    $scope.afterApplyValue = function() {
        $scope.$root.$broadcast('recordUpdated', selectedFile);
        $scope.$emit('closeModal');
    };
});
