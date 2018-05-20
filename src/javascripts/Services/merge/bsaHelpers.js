ngapp.service('bsaHelpers', function() {
    let bsaCache = {};

    let containerLoaded = function(bsaPath) {
        let loadedContainers = xelib.GetLoadedContainers();
        return loadedContainers.includes(bsaPath);
    };

    let loadBsaFiles = function(bsaPath) {
        if (!containerLoaded(bsaPath))
            xelib.LoadContainer(bsaPath);
        return xelib.GetContainerFiles(bsaPath);
    };

    let getBsaFiles = function(bsaPath) {
        if (!bsaCache[bsaPath])
            bsaCache[bsaPath] = loadBsaFiles(bsaPath);
        return bsaCache[bsaPath];
    };

    this.find = function(bsaPath, expr) {
        return getBsaFiles(bsaPath).filter(function(path) {
            return fh.minimatch(path, expr);
        });
    };
});
