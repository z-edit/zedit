ngapp.controller('ruleBrowserViewController', function($scope, $timeout, smashRuleService) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // load rules
    $scope.pluginsRules = smashRuleService.getRulesList('PluginRules');
    $scope.baseRules = smashRuleService.getRulesList('BaseRules');

    // scope functions
    $scope.newRule = function(e, rulesType) {
        let newRule = smashRuleService.newRule(rulesType);
        $scope.selectRule(newRule);
        e.stopPropagation();
    };

    $scope.selectRule = function(rule) {
        let ruleView = $scope.view.linkedRuleView;
        if (ruleView) $timeout(() => {
            ruleView.scope.editing = rule.hasOwnProperty('filename');
            ruleView.scope.rule = ruleView.scope.editing ?
                smashRuleService.getRulesFile(rule.filename) : rule;
        });
    };
});