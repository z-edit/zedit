ngapp.service('automationService', function($rootScope, $timeout, progressService) {
    let buildScriptFunction = function(scriptCode) {
        try {
            return new Function('zedit', 'fh', scriptCode);
        } catch (e) {
            alert('Exception parsing script: ' + e.message);
            console.log(e);
        }
    };

    let getSelectedNodes = function(targetScope) {
        return function() {
            if (!targetScope.selectedNodes) return [];
            return targetScope.selectedNodes.map(function(node) {
                return {
                    handle: node.handle,
                    element_type: node.element_type,
                    column_values: node.column_values.slice(),
                    class: node.class
                }
            });
        };
    };

    // TODO: Prompt and ShowModal
    let buildZEditContext = function(scope) {
        // callback functions are pascal case for clarity
        return {
            NavigateToElement: scope.navigateToElement,
            GetSelectedNodes: getSelectedNodes(targetScope),
            ShowProgress: progressService.showProgress,
            LogMessage: progressService.logMessage,
            ProgressMessage: progressService.progressMessage,
            AddProgress: progressService.addProgress,
            ProgressTitle: progressService.progressTitle
        }
    };

    this.runScript = function(targetScope, scriptCode, scriptFilename) {
        let scriptFunction = buildScriptFunction(scriptCode),
            zedit = buildZEditContext(targetScope);
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