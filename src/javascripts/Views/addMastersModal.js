ngapp.controller('addMastersModalController', function($scope, $timeout, errorService, modalService) {
    let opts = $scope.modalOptions;
    let selectedFile = opts.handle;
    let selectedFileIndex = xelib.GetFileLoadOrder(selectedFile);
    let allMasters =xelib.GetLoadOrder().split('\r\n');
    let availableMasters = allMasters.slice(0,selectedFileIndex).subtract(xelib.GetMasterNames(opts.handle));
    $scope.availableMasters = availableMasters.map(function(master){
        return {
            'name' : master,
            'active' : false
        };
    });
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
