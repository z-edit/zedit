ngapp.controller('refactorFileModalController', function($scope) {
    let node = $scope.modalOptions.nodes.last(),
        file = node.handle;

    $scope.filename = xelib.GetFileName(file);
    $scope.author = xelib.GetFileAuthor(file);
    $scope.description = xelib.GetFileDescription(file);

    $scope.doRefactor = function() {
        let originalFileName = xelib.GetFileName(file),
            originalAuthor = xelib.GetFileAuthor(file),
            originalDescription = xelib.GetFileDescription(file);
        if ($scope.filename !== originalFileName)
            xelib.RenameFile(file, $scope.filename);
        if ($scope.author !== originalAuthor)
            xelib.SetFileAuthor($scope.author);
        if ($scope.description !== originalDescription)
            xelib.SetFileDescription($scope.description);

        $scope.$root.$broadcast('reloadGUI');
        $scope.$emit('closeModal');
    };
});