ngapp.controller('errorCachingController', function($scope) {
    // scope functions
    // TODO: some of these should be moved to the errorCacheService
    $scope.buildFileEntry = function(filename, results) {
        let filePath = 'cache\\' + filename;
        let cachedErrors = fileHelpers.loadJsonFile(filePath, {});
        let modified = fileHelpers.getDateModified(filePath);
        return {
            hash: results[2],
            error_count: cachedErrors.length,
            modified: modified
        }
    };

    $scope.addCacheEntry = function(filename) {
        let fileRegex = /(.+\.es[p|m])\-([a-zA-Z0-9]{32})\.json/;
        let results = fileRegex.exec(filename);
        if (!results) return;
        let entry = $scope.errorCache.find(function(entry) {
            return entry.filename === results[1];
        });
        let file = $scope.buildFileEntry(filename, results);
        if (!entry) {
            $scope.errorCache.push({
                filename: results[1],
                files: [file]
            });
        } else {
            entry.files.push(file);
        }
    };

    $scope.loadErrorCache = function() {
        $scope.errorCache = [];
        fh.appDir.find('cache', {
            matching: '*.json',
            files: true,
            directories: false
        }).forEach(function(path) {
            let parts = path.split('\\');
            let filename = parts[parts.length - 1];
            try {
                $scope.addCacheEntry(filename);
            } catch(x) {
                console.log('Error adding error cache entry: ', x);
            }
        });
    };

    $scope.deleteCacheFile = function(filename) {
        fh.appDir.remove(`cache\\${filename}`);
    };

    $scope.deleteCacheEntry = function(cache, file) {
        if (!file || cache.files.length === 1) {
            let index = $scope.errorCache.indexOf(cache);
            cache.files.forEach(function(file) {
                $scope.deleteCacheFile(`${cache.filename}-${file.hash}.json`);
            });
            $scope.errorCache.splice(index, 1);
        } else {
            $scope.deleteCacheFile(`${cache.filename}-${file.hash}.json`);
            let index = cache.files.indexOf(file);
            cache.files.splice(index, 1);
        }
    };

    $scope.clearErrorCache = function() {
        if (!confirm('Clear the entire error cache?')) return;
        $scope.errorCache.forEach(function(cache) {
            $scope.deleteCacheEntry(cache);
        });
    };

    // initialization
    $scope.loadErrorCache();
});
