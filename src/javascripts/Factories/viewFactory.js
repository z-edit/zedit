ngapp.service('viewFactory', function(randomService) {
    let viewConstructors = {},
        accessibleViews = {};

    let bind = function(fn, thisArg) {
        if (!fn) return () => {};
        return fn.bind(thisArg);
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

    this.new = function(viewName, factory, options = {}) {
        let view = {};
        return Object.assign(view, {
            templateUrl: `partials/${viewName}.html`,
            controller: `${viewName}Controller`,
            class: viewName.underscore('-'),
            label: viewName.humanize(),
            destroy: bind(factory.destroy, view),
            isLinkedTo: bind(factory.isLinkedTo, view),
            canLinkTo: bind(factory.canLinkTo, view),
            linkTo: bind(factory.linkTo, view)
        }, options);
    }
});
