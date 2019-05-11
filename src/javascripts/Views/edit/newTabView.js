ngapp.controller('newTabViewController', function($scope, viewFactory) {
    let views = viewFactory.getAccessibleViews();
    $scope.viewNames = views.mapOnKey('name');

    // scope functions
    $scope.selectView = function(viewName) {
        let view = views.findByKey('name', viewName);
        $scope.$emit('changeView', view.id);
    };
});
