ngapp.service('automationService', function() {
    let buildScriptFunction = function(scriptCode) {
        try {
            return new Function('xelib', 'zedit', scriptCode);
        } catch(e) {
            alert('Exception parsing script: ' + e.message);
            console.log(e);
        }
    };

    let buildZEditContext = function(scope) {
        // TODO
        let nullFn = () => {};
        return {
            Prompt: nullFn,
            GetSelectedTreeNodes: nullFn,
            GetSelectedRecordNodes: nullFn,
            NavigateToElement: nullFn,
            OpenRecord: nullFn,
            ShowProgress: nullFn,
            SetProgress: nullFn,
            SetMaxProgress: nullFn,
            ProgressMessage: nullFn,
            LogMessage: nullFn
        }
    };

    this.runScript = function(scope, scriptCode) {
        let scriptFunction = buildScriptFunction(scriptCode),
            zedit = buildZEditContext(scope);
        xelib.CreateHandleGroup();
        try {
            scriptFunction(xelib, zedit);
        } catch(e) {
            scope.$emit('hideProgressModal');
            alert('Exception running script: ' + e.message);
        } finally {
            xelib.FreeHandleGroup();
        }
    };
});