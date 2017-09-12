ngapp.service('automationService', function($rootScope, $timeout, progressService) {
    let buildScriptFunction = function(scriptCode) {
        try {
            return new Function('zedit', 'fh', scriptCode);
        } catch (e) {
            alert('Exception parsing script: ' + e.message);
            console.log(e);
        }
    };

    let getSelectedNodes = function(scope) {
        $rootScope.$broadcast('getSelectedNodes');
        if (!scope.selectedNodes) return [];
        return scope.selectedNodes.map(function(node) {
            return {
                handle: node.handle,
                element_type: node.element_type,
                column_values: node.column_values.slice()
            }
        });
    };

    // TODO: Prompt and ShowModal
    let buildZEditContext = function(scope) {
        // callback functions are pascal case for clarity
        return {
            NavigateToElement: scope.navigateToElement,
            ShowProgress: progressService.showProgress,
            LogMessage: progressService.logMessage,
            ProgressMessage: progressService.progressMessage,
            AddProgress: progressService.addProgress,
            ProgressTitle: progressService.progressTitle,
            SelectedNodes: getSelectedNodes(scope)
        }
    };

    this.runScript = function(scope, scriptCode, scriptFilename) {
        let scriptFunction = buildScriptFunction(scriptCode),
            zedit = buildZEditContext(scope);
        xelib.CreateHandleGroup();
        progressService.showProgress({
            determinate: false,
            message: `Executing ${scriptFilename}...`
        });
        $timeout(function() {
            try {
                scriptFunction(zedit, fh);
            } catch(e) {
                alert('Exception running script: ' + e.stack);
            } finally {
                $rootScope.$broadcast('reloadGUI');
                progressService.hideProgress();
                xelib.FreeHandleGroup();
            }
        }, 50);
    };
});