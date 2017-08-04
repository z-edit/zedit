export default function(ngapp, fileHelpers) {
    ngapp.directive('settingsModal', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/settingsModal.html',
            controller: 'settingsModalController',
            scope: false
        }
    });

    ngapp.controller('settingsModalController', function($scope, formUtils, settingsService) {
        // inherited functions
        $scope.unfocusSettingsModal = formUtils.unfocusModal($scope.saveSettings);

        // initialize scope variables
        $scope.settings = settingsService.settings;
        $scope.profileName = settingsService.currentProfile.name;

        // scope functions
        $scope.saveSettings = function() {
            settingsService.saveSettings($scope.settings);
            $scope.toggleSettingsModal();
        };

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
            let paths = fileHelpers.appDir.find('cache', { matching: '*.json', files: true, directories: false });
            paths.forEach(function(path) {
                let parts = path.split('\\');
                let filename = parts[parts.length - 1];
                try {
                    $scope.addCacheEntry(filename);
                } catch(x) {
                    console.log('Error adding error cache entry:');
                    console.log(x);
                }
            });
        };

        $scope.deleteFile = function(filename) {
            fileHelpers.appDir.remove(`cache\\${filename}`);
        };

        $scope.deleteCache = function(cache, file) {
            if (!file || cache.files.length == 1) {
                let index = $scope.errorCache.indexOf(cache);
                cache.files.forEach(function(file) {
                    $scope.deleteFile(`${cache.filename}-${file.hash}.json`);
                });
                $scope.errorCache.splice(index, 1);
            } else {
                $scope.deleteFile(`${cache.filename}-${file.hash}.json`);
                let index = cache.files.indexOf(file);
                cache.files.splice(index, 1);
            }
        };

        $scope.clearErrorCache = function() {
            if (!confirm('Clear the entire error cache?')) return;
            $scope.errorCache.forEach(function(cache) {
                $scope.deleteCache(cache);
            });
        };

        $scope.toggleErrorCache = function(visible) {
            if (visible && !$scope.errorCache) $scope.loadErrorCache();
            $scope.showErrorCache = visible;
        };
    });
}
