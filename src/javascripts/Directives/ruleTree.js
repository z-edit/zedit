ngapp.directive('ruleTree', function() {
    return {
        restrict: 'E',
        scope: {
            tree: '=?'
        },
        templateUrl: 'directives/ruleTree.html',
        controller: 'ruleTreeController'
    }
});

ngapp.controller('ruleTreeController', function($scope, contextMenuService) {
    contextMenuService.buildFunctions($scope, 'ruleTree');
});