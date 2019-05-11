ngapp.run(function($rootScope, viewFactory, viewLinkingService) {
    let newView = function() {
        let view = viewFactory.new('ruleBrowserView');

        view.destroy = function() {
            this.unlinkAll();
        };

        viewLinkingService.buildFunctions(view, 'linkedRuleBrowserView', [
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
