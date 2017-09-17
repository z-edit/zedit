ngapp.controller('automateModalController', function($scope, $rootScope, $timeout, modalService, automationService) {
    // helper functions
    let compare = function(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    };

    let getNewScriptPath = function() {
        let filePath = `scripts\\New Script.js`,
            counter = 2;
        while (fh.jetpack.exists(filePath)) {
            filePath = `scripts\\New Script ${counter++}.js`;
        }
        return filePath;
    };

    // scope variables
    $scope.sortModes = [{
        label: 'Sort by Recent',
        compare: (a, b) => { return compare(a.lastRun, b.lastRun); }
    }, {
        label: 'Sort by Filename',
        compare: (a, b) => {
            return compare(a.filename.toUpperCase(), b.filename.toUpperCase());
        }
    }];

    // inherited functions
    modalService.buildUnfocusModalFunction($scope, 'closeModal');

    // scope functions
    $scope.setSortMode = (sortMode) => $scope.sortMode = sortMode;
    $scope.sortScripts = () => $scope.scripts.sort($scope.sortMode.compare);

    $scope.saveScript = function() {
        let script = $scope.selectedScript,
            originalFilename = script.filePath.split('\\').last();
        if (originalFilename !== script.filename) {
            let newFilePath = `scripts\\${script.filename}`;
            fh.jetpack.move(script.filePath, newFilePath);
            script.filePath = newFilePath;
        }
        fh.saveTextFile(script.filePath, $scope.scriptContents);
    };

    $scope.closeModal = function() {
        $scope.saveScript();
        $scope.$emit('closeModal');
    };

    $scope.runScript = function() {
        let scriptFilename = $scope.selectedScript.filename,
            scriptCode = $scope.scriptContents,
            targetScope = $scope.modalOptions.targetScope;
        $scope.closeModal();
        automationService.runScript(targetScope, scriptCode, scriptFilename);
    };

    $scope.selectScript = function(item) {
        $scope.selectedScript = item;
        $scope.scriptContents = fh.loadTextFile($scope.selectedScript.filePath);
    };

    $scope.loadScripts = function() {
        fh.jetpack.dir('scripts');
        let scripts = fh.jetpack.find('scripts', { matching: '*.js'}),
            scriptHistory = fh.loadJsonFile('scripts\\history.json', {});
        $scope.scripts = scripts.map(function(filePath) {
            let filename = filePath.split('\\').last();
            return {
                filePath: filePath,
                filename: filename,
                lastRun: scriptHistory[filename] || new Date(0)
            }
        });
    };

    $scope.newScript = function() {
        let filePath = getNewScriptPath();
        $scope.scripts.unshift({
            filePath: filePath,
            filename: filePath.split('\\').last(),
            lastRun: new Date()
        });
        $scope.selectedScript = $scope.scripts[0];
    };

    // event handlers
    $scope.$watch('sortMode', $scope.sortScripts);

    // initialization
    $scope.loadScripts();
    $scope.setSortMode($scope.sortModes[0]);
    if ($scope.scripts.length === 0) $scope.newScript();
    $scope.selectScript($scope.scripts[0]);
});
