ngapp.controller('automateModalController', function($scope, modalService, automationService) {
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
            return compare(a.fileName.toUpperCase(), b.fileName.toUpperCase());
        }
    }];

    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.setSortMode = (sortMode) => $scope.sortMode = sortMode;
    $scope.sortScripts = () => $scope.scripts.sort($scope.sortMode.compare);
    $scope.runScript = function() {
        automationService.runScript($scope, $scope.scriptContents);
        $scope.$emit('closeModal');
    };

    $scope.saveScript = function() {
        fh.saveTextFile($scope.selectedScript.filePath, $scope.scriptContents);
    };

    $scope.scriptChanged = function() {
        if ($scope.selectedScript) {
            $scope.scriptContents = fh.loadTextFile($scope.selectedScript.filePath);
        } else {
            $scope.scriptContents = '';
        }
    };

    $scope.loadScripts = function() {
        fh.jetpack.dir('scripts');
        let scripts = fh.jetpack.find('scripts', { matching: '*.js'}),
            scriptHistory = fh.loadJsonFile('scripts/history.json', {});
        $scope.scripts = scripts.map(function(filePath) {
            let fileName = filePath.split('\\').last();
            return {
                filePath: filePath,
                fileName: fileName,
                lastRun: scriptHistory[fileName] || new Date(0)
            }
        });
    };

    $scope.newScript = function() {
        let filePath = getNewScriptPath();
        $scope.scripts.unshift({
            filePath: filePath,
            fileName: filePath.split('\\').last(),
            lastRun: new Date()
        });
        $scope.selectedScript = $scope.scripts[0];
    };

    // event handlers
    $scope.$watch('sortMode', $scope.sortScripts);
    $scope.$watch('selectedScript', $scope.scriptChanged);

    // initialization
    $scope.loadScripts();
    $scope.setSortMode($scope.sortModes[0]);
    if ($scope.scripts.length === 0) $scope.newScript();
    $scope.selectedScript = $scope.scripts[0];
});
