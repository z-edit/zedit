ngapp.controller('ruleViewController', function($scope, layoutService, viewFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // scope functions
    $scope.save = function() {
        // TODO
    };

    $scope.linkToView = function(className) {
        let targetView = layoutService.findView(view => {
            return view.class === className && !view.linkedRuleView;
        });
        viewFactory.link($scope.view, targetView);
    };

    // initialization
    $scope.linkToView('rule-browser-view');
});