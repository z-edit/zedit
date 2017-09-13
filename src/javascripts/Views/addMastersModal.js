ngapp.controller('addMastersModalController', function($scope, $timeout, errorService, modalService) {
    // initialization
    let selectedFile = $scope.modalOptions.handle,
        availableMasters = xelib.GetAvailableMasters(selectedFile);
    $scope.filename = xelib.Name(selectedFile);
    $scope.availableMasters = availableMasters.map(function(master){
        return { name: master, active: false };
    });

    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.applyValue = function() {
        errorService.try(function() {
            $scope.availableMasters.forEach(function(master) {
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
