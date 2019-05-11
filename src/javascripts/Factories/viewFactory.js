ngapp.service('viewFactory', function(randomService) {
    let views = [];

    this.link = function(view, otherView) {
        if (!view || !otherView) return;
        view.linkTo(otherView);
        otherView.linkTo(view);
    };

    this.unlink = function(linkedView, linkKey) {
        if (!linkedView) return;
        delete linkedView[linkKey];
    };

    this.registerView = function(view) {
        views.push(view);
    };

    this.newView = function(viewId, active = false) {
        let view = views.findByKey('id', viewId);
        if (!view) throw new Error('Could not resolve view ' + viewId);
        let instance = view.new();
        instance.id = randomService.generateUniqueId();
        instance.active = active;
        return instance;
    };

    this.getAccessibleViews = function() {
        return views.filter(view => view.isAccessible());
    };

    this.new = function(viewName, options) {
        return Object.assign({
            templateUrl: `partials/${viewName}.html`,
            controller: `${viewName}Controller`,
            class: viewName.underscore('-'),
            label: viewName.humanize(),
            destroy: () => {}
        }, options || {});
    }
});
