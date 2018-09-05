ngapp.service('pexService', function() {
    /*let {PexFile} = require('pex-parser'),
        {loopWhile} = require('deasync');*/

    this.loadScript = function(scriptPath) {
        let script = new PexFile(fh.jetpack.path(scriptPath)),
            done = false,
            error = undefined;
        script.parse(err => {
            done = true;
            error = err;
        });
        //loopWhile(() => !done);
        if (error) throw error;
        return script;
    };

    this.saveScript = function(script) {
        let done = false,
            error = undefined;
        script.write(err => {
            done = true;
            error = err;
        });
        //loopWhile(() => !done);
        if (error) throw error;
    };

    this.getFileRefs = function(script) {

    };
});
