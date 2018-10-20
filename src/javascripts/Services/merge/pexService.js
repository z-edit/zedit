ngapp.service('pexService', function() {
    let service = this,
        {PexFile} = require('pex-parser');

    const pluginExpr = new RegExp(/\.(esp|esm|esl)$/i);

    this.loadScript = function(scriptPath) {
        let script = new PexFile(scriptPath);
        script.parse();
        return script;
    };

    this.saveScript = function(script, filePath) {
        if (filePath) script.filePath = filePath;
        script.write();
    };

    this.getFileRefs = function(scriptPath) {
        let {stringTable} = service.loadScript(scriptPath);
        return stringTable.filter(str => pluginExpr.test(str));
    };

    this.getFunctions = function(script) {
        let functions = [];
        script.objects.forEach(object => {
            object.data.states.forEach(state => {
                state.functions.mapOnKey('function')
                    .forEach(fn => functions.push(fn));
            });
            object.data.properties.forEach(prop => {
                let {readHandler, writeHandler} = prop;
                if (readHandler) functions.push(readHandler);
                if (writeHandler) functions.push(writeHandler);
            });
        });
        return functions;
    };
});
