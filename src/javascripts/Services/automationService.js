ngapp.service('automationService', function($rootScope, $timeout, progressService) {
    let keepOpen;

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
            return targetScope.selectedNodes.map(node => ({
                handle: node.handle,
                element_type: node.element_type,
                column_values: node.column_values.slice(),
                class: node.class
            }));
        };
    };

    let getSelectedRecords = function(targetScope) {
        return function(sig) {
            if (!targetScope.selectedNodes) return [];
            return targetScope.selectedNodes.filter(node => {
                if (node.element_type !== xelib.etMainRecord) return;
                return !sig || xelib.Signature(node.handle) === sig;
            }).map(node => node.handle);
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

    let showProgress = function(progress) {
        keepOpen = progress.determinate;
        progressService.showProgress(progress);
    };

    // TODO: Prompt and ShowModal
    let buildZEditContext = function(targetScope) {
        // these functions are pascal case for clarity
        return {
            NavigateToElement: navigateToElement(targetScope),
            GetSelectedNodes: getSelectedNodes(targetScope),
            GetSelectedRecords: getSelectedRecords(targetScope),
            ShowProgress: showProgress,
            LogMessage: progressService.logMessage,
            ProgressMessage: progressService.progressMessage,
            AddProgress: progressService.addProgress,
            ProgressTitle: progressService.progressTitle
        }
    };

    let executeScriptFn = function(scriptFn, zedit) {
        try {
            scriptFn(zedit, fh);
        } catch(e) {
            alert('Exception running script: ' + e.stack);
        } finally {
            xelib.FreeHandleGroup();
            $rootScope.$broadcast('reloadGUI');
            let method = keepOpen ? 'allowClose' : 'hideProgress';
            progressService[method]();
        }
    };

    this.runScript = function(targetScope, scriptCode, scriptFilename) {
        let scriptFn = buildScriptFunction(scriptCode),
            zedit = buildZEditContext(targetScope);
        xelib.CreateHandleGroup();
        showProgress({
            determinate: false,
            message: `Executing ${scriptFilename}...`
        });
        $timeout(() => executeScriptFn(scriptFn, zedit), 50);
    };
});
