var recordTreeViewController = function($scope, xelibService) {
    $scope.buildColumns = function() {
        $scope.columns = []
        xelibService.withHandles(xelib.GetOverrides($scope.record), function(overrides) {

        });
    };

    $scope.$watch('record', function() {
        if (!xelib.IsMaster($scope.record)) {
            $scope.record = xelib.Master($scope.record);
        }
        $scope.buildColumns();
        $scope.buildTree();
    });

    // TODO: remove this
    $scope.record = xelib.GetElement('Skyrim.esm\\00012E46');
};