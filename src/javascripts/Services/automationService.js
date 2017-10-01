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

    let navigateToElement = function(targetScope) {
        return function(element, open) {
            xelib.OutsideHandleGroup(function() {
                try {
                    targetScope.navigateToElement(element, open);
                } catch (x) {
                    console.log(`Failed to navigate to element, ${x.message}`);
                }
            });
        }
    };

    // TODO: Prompt and ShowModal
    let buildZEditContext = function(targetScope) {
        // callback functions are pascal case for clarity
        return {
            NavigateToElement: navigateToElement(targetScope),
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
                xelib.FreeHandleGroup();
                $rootScope.$broadcast('reloadGUI');
                progressService.hideProgress();
            }
        }, 50);
    };
});
