ngapp.controller('refactorFileModalController', function($scope) {
    $scope.file = $scope.modalOptions.nodes.last();
    $scope.filename = xelib.GetFileName($scope.file);
    $scope.author = xelib.GetFileAuthor($scope.file);
    $scope.description = xelib.GetFileDescription($scope.file);

    $scope.doRefactor = function() {
        let originalFileName = xelib.GetFileName($scope.file),
            originalAuthor = xelib.GetFileAuthor($scope.file),
            originalDescription = xelib.GetFileDescription($scope.file);
        if ($scope.filename !== originalFileName)
            xelib.RenameFile($scope.file, $scope.filename);
        if ($scope.author !== originalAuthor)
            xelib.SetFileAuthor($scope.author);
        if ($scope.description !== originalDescription)
            xelib.SetFileDescription($scope.description);

        $scope.$root.$broadcast('reloadGUI');
        $scope.$emit('closeModal');
    };
});