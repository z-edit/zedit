ngapp.run(function($rootScope, viewFactory, viewLinkingInterface) {
    let newView = function() {
        let view = viewFactory.new('ruleView');

        view.destroy = () => view.unlinkAll();

        viewLinkingInterface(view, 'linkedRuleView', [
            'rule-browser-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'ruleView',
        new: newView,
        name: 'Rule View',
        isAccessible: () => $rootScope.appMode.id === 'smash'
    });
});
