export default function(ngapp) {
    ngapp.service('viewFactory', function($window) {
        if (!$window.viewConstructors) {
            $window.viewConstructors = {};
        }

        this.registerView = function(viewName, constructor) {
            $window.viewConstructors[viewName] = constructor;
        };

        this.newView = function(viewName) {
            return $window.viewConstructors[viewName]();
        };
    });
};
