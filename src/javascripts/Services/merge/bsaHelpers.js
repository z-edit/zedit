ngapp.service('bsaHelpers', function(mergeLogger) {
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
            outputPath = fh.jetpack.path(`temp\\${bsaFileName}\\${filePath}`);
        if (fh.jetpack.exists(outputPath) !== 'file') {
            mergeLogger.log(`Extracting ${filePath} from ${bsaFileName}`, true);
            xelib.ExtractFile(bsaFileName, filePath, outputPath);
        }
        return outputPath;
    };

    this.extractArchive = function(archive) {
        let outputPath = fh.jetpack.path(`temp\\${archive.filename}`);
        if (fh.jetpack.exists(outputPath) !== 'dir') {
            mergeLogger.log(`Extracting ${archive.filename}`, true);
            xelib.ExtractContainer(archive.filePath, outputPath + '\\', true);
        }
        return outputPath;
    };
});
