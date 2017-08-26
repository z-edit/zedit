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
});