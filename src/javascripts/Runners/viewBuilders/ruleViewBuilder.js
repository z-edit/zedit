ngapp.run(function($rootScope, viewFactory, viewLinkingService) {
    let newView = function() {
        let view = viewFactory.new('ruleView');

        view.destroy = () => view.unlinkAll();

        viewLinkingService.buildFunctions(view, 'linkedRuleView', [
            'rule-browser-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'ruleView',
        new: newView,
        name: 'Rule View',
        isAccessible: () => $rootScope.appMode === 'smash'
    });
});
