ngapp.run(function($rootScope, viewFactory, viewLinkingInterface) {
    let newView = function() {
        let view = viewFactory.new('ruleBrowserView');

        view.destroy = function() {
            this.unlinkAll();
        };

        viewLinkingInterface(view, 'linkedRuleBrowserView', [
            'rule-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'ruleBrowserView',
        new: newView,
        name: 'Rule Browser View',
        isAccessible: () => $rootScope.appMode === 'smash'
    });
});
