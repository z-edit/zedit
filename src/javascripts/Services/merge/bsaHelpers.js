ngapp.service('bsaHelpers', function() {
    let bsaCache = {};

    let getBsaFiles = function(bsaPath) {
        if (!bsaCache[bsaPath])
            bsaCache[bsaPath] = xelib.GetContainerFiles(bsaPath);
        return bsaCache[bsaPath];
    };

    this.find = function(bsaPath, expr) {
        return getBsaFiles(bsaPath).filter(function(path) {
            return fh.minimatch(path, expr);
        });
    };
});
