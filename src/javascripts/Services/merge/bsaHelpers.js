ngapp.service('bsaHelpers', function(progressLogger) {
    let service = this,
        bsaCache = {},
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
        return xelib.GetContainerFiles(bsaPath, '');
    };

    let getBsaFiles = function(bsaPath) {
        if (!bsaCache[bsaPath])
            bsaCache[bsaPath] = loadBsaFiles(bsaPath);
        return bsaCache[bsaPath];
    };

    // PUBLIC API
    this.find = function(bsaPath, pattern) {
        let expr = new Minimatch(pattern, { nocase: true });
        return getBsaFiles(bsaPath).filter(path => expr.match(path));
    };

    this.getFiles = function(bsaPath) {
        return getBsaFiles(bsaPath);
    };

    this.extractFile = function(bsaFileName, filePath) {
        let outputPath = fh.path('temp', bsaFileName, filePath);
        if (!fh.fileExists(outputPath)) {
            progressLogger.log(`Extracting ${filePath} from ${bsaFileName}`, true);
            xelib.ExtractFile(bsaFileName, filePath, outputPath);
        }
        return outputPath;
    };

    this.extractAsset = function(asset) {
        let match = asset.filePath.match(bsaExpr);
        if (!match) return;
        let [,bsaFileName,filePath] = match;
        return service.extractFile(bsaFileName, filePath);
    };

    this.extractArchive = function(archive) {
        let outputPath = fh.path('temp', archive.filename) + '\\';
        if (!fh.directoryExists(outputPath)) {
            progressLogger.log(`Extracting ${archive.filename}`, true);
            xelib.ExtractContainer(archive.filePath, outputPath, true);
        }
        return outputPath;
    };
});
