ngapp.controller('automateModalController', function($scope, $rootScope, $timeout, modalService, automationService, hotkeyService) {
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

    let sortScripts = () => $scope.scripts.sort($scope.sortMode.compare);

    let createScriptIfNone = function() {
        if ($scope.scripts.length === 0) $scope.newScript();
    };

    let loadScripts = function() {
        fh.jetpack.dir('scripts');
        let scripts = fh.jetpack.find('scripts', { matching: '*.js'});
        $scope.scriptHistory = fh.loadJsonFile('scripts\\history.json') || {};
        $scope.scripts = scripts.map(filePath => {
            let filename = filePath.split('\\').last();
            return {
                filePath: filePath,
                filename: filename,
                lastRun: new Date($scope.scriptHistory[filename] || 0)
            }
        });
    };

    let saveHistory = function() {
        fh.saveJsonFile('scripts\\history.json', $scope.scriptHistory);
    };

    // scope variables
    $scope.sortModes = [{
        label: 'Sort by Recent',
        compare: (a, b) => { return b.lastRun - a.lastRun }
    }, {
        label: 'Sort by Filename',
        compare: (a, b) => {
            return compare(a.filename.toUpperCase(), b.filename.toUpperCase());
        }
    }];

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onModalKeyDown', 'automateModal');

    // scope functions
    $scope.setSortMode = function(sortMode) {
        $scope.sortMode = sortMode;
        sortScripts();
    };

    $scope.saveScript = function() {
        let script = $scope.selectedScript,
            originalFilename = script.filePath.split('\\').last();
        if (originalFilename !== script.filename) {
            let newFilePath = `scripts\\${script.filename}`;
            if (fh.jetpack.exists(script.filePath)) {
                fh.jetpack.move(script.filePath, newFilePath);
            }
            script.filePath = newFilePath;
        }
        fh.saveTextFile(script.filePath, $scope.scriptContents);
    };

    $scope.deleteScript = function() {
        fh.jetpack.remove($scope.selectedScript.filePath);
        $scope.scripts.remove($scope.selectedScript);
        createScriptIfNone();
        $scope.selectScript($scope.scripts[0]);
    };

    $scope.closeModal = function() {
        saveHistory();
        $scope.saveScript();
        $scope.$emit('closeModal');
    };

    $scope.handleF2 = () => $scope.$broadcast('focusScriptFileName');

    $scope.runScript = function() {
        let scriptFilename = $scope.selectedScript.filename,
            scriptCode = $scope.scriptContents,
            targetScope = $scope.modalOptions.targetScope;
        $scope.scriptHistory[scriptFilename] = new Date();
        $scope.closeModal();
        automationService.runScript(targetScope, scriptCode, scriptFilename);
    };

    $scope.selectScript = function(item) {
        $scope.selectedScript = item;
        $scope.scriptContents = fh.loadTextFile(item.filePath);
    };

    $scope.newScript = function() {
        let filePath = getNewScriptPath();
        $scope.scripts.unshift({
            filePath: filePath,
            filename: filePath.split('\\').last(),
            lastRun: new Date()
        });
        $scope.selectScript($scope.scripts[0]);
    };

    // initialization
    loadScripts();
    createScriptIfNone();
    $scope.setSortMode($scope.sortModes[0]);
    $scope.selectScript($scope.scripts[0]);
});
