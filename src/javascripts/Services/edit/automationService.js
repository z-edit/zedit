ngapp.service('automationService', function($rootScope, $timeout, progressService, timerService) {
    let keepOpen;

    let buildScriptFunction = function(scriptCode) {
        try {
            return new Function('zedit', 'fh', scriptCode);
        } catch (e) {
            logger.error(`Exception parsing script: ${e.message}`);
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
            xelib.OutsideHandleGroup(() => {
                try {
                    targetScope.navigateToElement(element, open);
                } catch (x) {
                    logger.error(`Failed to navigate to element, ${x.message}`);
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
            StartTimer: timerService.start,
            PauseTimer: timerService.pause,
            ResumeTimer: timerService.resume,
            GetSeconds: timerService.getSeconds,
            LogMessage: progressService.logMessage,
            ProgressMessage: progressService.progressMessage,
            AddProgress: progressService.addProgress,
            ProgressTitle: progressService.progressTitle
        }
    };

    let executeScriptFn = function(scriptFn, zedit) {
        try {
            scriptFn(zedit, fh);
            let timeStr = timerService.getSecondsStr('script');
            logger.info(`Script completed in ${timeStr}`);
        } catch(e) {
            logger.error(`Exception running script: \n${e.stack}`);
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
        targetScope.$emit('executingScript', scriptFilename);
        timerService.start('script');
        showProgress({
            determinate: false,
            message: `Executing ${scriptFilename}...`
        });
        $timeout(() => executeScriptFn(scriptFn, zedit), 50);
    };
});
