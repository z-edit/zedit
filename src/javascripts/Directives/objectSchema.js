ngapp.directive('objectSchema', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/objectSchema.html',
        controller: 'objectSchemaController',
        scope: {
            basePath: '@',
            path: '@',
            schema: '=?'
        },
        replace: true
    }
});

ngapp.controller('objectSchemaController', function($scope) {
    let loadSchema = function() {
        let basePath = $scope.basePath || 'app/docs/development/apis',
            path = `${basePath}/${$scope.path}`;
        return fh.loadResource(path) || fh.loadJsonFile(path);
    };

    if ($scope.path) {
        $scope.schema = loadSchema();
    }
});
