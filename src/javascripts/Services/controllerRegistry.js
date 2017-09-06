ngapp.service('controllerRegistry', function() {
    let service = this,
        controllers = {};

    this.get = function(controllerName) {
        if (!controllers.hasOwnProperty(controllerName)) {
            throw new Error(`ERROR: Controller ${controllerName} is not registered.`);
        }
        return controllers[controllerName];
    };

    this.resolve = function(ctrl) {
        if (!ctrl) return () => {};
        return typeof ctrl === 'string' ? service.get(ctrl) : ctrl;
    };

    this.register = function(controllerName, controllerFn) {
        controllers[controllerName] = controllerFn;
    };
});