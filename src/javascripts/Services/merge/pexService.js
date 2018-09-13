ngapp.service('pexService', function() {
    let {PexFile} = require('pex-parser');

    this.loadScript = function(scriptPath) {
        let script = new PexFile(scriptPath);
        script.parse();
        return script;
    };

    this.saveScript = function(script, filePath) {
        if (filePath) script.filePath = filePath;
        script.write();
    };

    this.getFileRefs = function(script) {

    };
});
