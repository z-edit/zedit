ngapp.controller('installedModulesController', function($scope, extensionService) {
    $scope.modules = extensionService.getInstalledModules();

    // scope functions
    $scope.uninstallModule = function(module) {
        fs.jetpack.remove(module.modulePath);
        $scope.showRestart = true;
    };

    $scope.toggleModule = function(module) {
        // TODO
    };

    $scope.openRepo = function(module) {
        fh.open(module.repo);
    };

    $scope.installModule = function() {
        let moduleFile = fh.selectFile('Select a module archive to install.', '', [
            { name: 'ZIP Archive', extensions: ['zip'] }
        ]);
        if (!moduleFile) return;
        try {
            extensionService.installModule(moduleFile);
            $scope.showRestart = true;
        } catch (x) {
            alert(`Error extracting module archive:\r\n${x.stack}`);
        }
    };
});
