ngapp.service('viewFactory', function(randomService) {
    let viewConstructors = {},
        accessibleViews = {};

    this.link = function(view, otherView) {
        if (!view || !otherView) return;
        view.linkTo(otherView);
        otherView.linkTo(view);
    };

    this.unlink = function(linkedView, linkKey) {
        if (!linkedView) return;
        delete linkedView[linkKey];
    };

    this.registerView = function(viewName, constructor, accessibleName) {
        viewConstructors[viewName] = constructor;
        if (accessibleName) accessibleViews[accessibleName] = viewName;
    };

    this.newView = function(viewName, active = false) {
        let view = viewConstructors[viewName]();
        view.id = randomService.generateUniqueId();
        view.active = active;
        return view;
    };

    this.getAccessibleViews = function() {
        return angular.copy(accessibleViews);
    };

    this.new = function(viewName) {
        return {
            templateUrl: `partials/${viewName}.html`,
            controller: `${viewName}Controller`,
            class: viewName.underscore('-'),
            label: viewName.humanize()
        };
    }
});
