ngapp.controller('addMastersModalController', function($scope, $timeout, errorService, modalService) {
    let selectedFile = $scope.modalOptions;
    let selectedFileLoadOrder = xelib.GetFileLoadOrder(selectedFile);
    let allMasters = xelib.GetLoadedFileNames();
    allMasters.splice(1,1); //allMasters also includes hardcoded.dat
    let currentMasters = xelib.GetMasterNames(selectedFile);
    let availableMasters = allMasters.slice(0,selectedFileLoadOrder).subtract(currentMasters);
    
    $scope.availableMasters = availableMasters.map(function(master){
        return {
            'name' : master,
            'active' : false
        };
    });

    modalService.buildUnfocusModalFunction($scope);

    $scope.applyValue = function() {
        if ($scope.invalid) return;
        errorService.try(function() {
            console.log($scope.availableMasters);
            for(let master of $scope.availableMasters){
                if(master.active){
                    xelib.AddMaster(selectedFile,master.name);
                }
            }
            $scope.afterApplyValue();
        });
    }

    $scope.afterApplyValue = function() {
        $scope.$root.$broadcast('recordUpdated', selectedFile);
        $scope.$emit('closeModal');
    };


});
