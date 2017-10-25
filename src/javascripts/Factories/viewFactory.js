ngapp.service('viewFactory', function(randomService) {
    let viewConstructors = {},
        accessibleViews = {};

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
            destroy: factory.destroy,
            isLinkedTo: factory.isLinkedTo && factory.isLinkedTo.bind(view),
            canLinkTo: factory.canLinkTo && factory.canLinkTo.bind(view),
            linkTo: factory.linkTo && factory.linkTo.bind(view)
        }, options);
    }
});
