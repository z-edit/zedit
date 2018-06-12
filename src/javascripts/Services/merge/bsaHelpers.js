ngapp.service('bsaHelpers', function() {
    let bsaCache = {},
        Minimatch = fh.minimatch.Minimatch;

    let bsaExpr = /([^\\]+\.(?:bsa|ba2))\\(.+)/i;

    // PRIVATE
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

    // PUBLIC API
    this.find = function(bsaPath, pattern) {
        let expr = new Minimatch(pattern, { nocase: true });
        return getBsaFiles(bsaPath).filter(function(path) {
            return expr.match(path);
        });
    };

    this.extractAsset = function(merge, asset) {
        let match = asset.filePath.match(bsaExpr);
        if (!match) return;
        let [,bsaFileName,filePath] = match,
            //bsaPath = merge.dataFolders[asset.plugin] + bsaFileName,
            outputPath = fh.jetpack.path(`temp\\${bsaFileName}\\${filePath}`);
        xelib.ExtractFile(bsaFileName, filePath, outputPath);
        return outputPath;
    };
});
