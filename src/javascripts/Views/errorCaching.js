ngapp.controller('errorCachingController', function($scope, errorCacheService) {
    // scope functions
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
    $scope.errorCache = errorCacheService.getCache();
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Error Caching',
        appModes: ['clean'],
        templateUrl: 'partials/settings/errorCaching.html',
        controller: 'errorCachingController',
        defaultSettings: {
            cacheErrors: true
        }
    });
});
