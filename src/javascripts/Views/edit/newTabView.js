ngapp.controller('newTabViewController', function($scope, viewFactory) {
    let views = viewFactory.getAccessibleViews();
    $scope.viewNames = Object.keys(views);
    $scope.selectView = (viewName) => $scope.$emit('changeView', views[viewName]);
});
