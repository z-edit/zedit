ngapp.directive('fileSelect', function() {
    return {
        restrict: 'E',
        scope: {
            model: '='
        },
        templateUrl: 'directives/fileSelect.html',
        controller: 'fileSelectController'
    }
});

ngapp.controller('fileSelectController', function($scope) {
    let fileNames = xelib.GetLoadedFileNames();

    $scope.fileSearch = function(str) {
        return fileNames.filter((fileName) => {
            return fileName.startsWith(str);
        });
    };
});
