ngapp.service('pexService', function() {
    let {PexFile} = require('pex-parser');

    this.loadScript = function(scriptPath) {
        let script = new PexFile(fh.jetpack.path(scriptPath));
        script.parse();
        return script;
    };

    this.saveScript = function(script, callback) {
        script.write(callback);
    };

    this.getFileRefs = function(script) {

    };
});
