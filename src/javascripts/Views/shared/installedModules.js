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
        module.repo && fh.openUrl(module.repo);
    };

    $scope.restart = function() {
        $scope.$emit('restart');
    };

    $scope.installModule = function() {
        let moduleFile = fh.selectFile('Select a module to install.', '', [
            { name: 'Archive', extensions: ['zip'] },
            { name: 'module.json', extensions: ['json'] }
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
