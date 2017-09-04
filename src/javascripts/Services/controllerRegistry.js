ngapp.service('controllerRegistry', function() {
    let controllers = {};

    this.get = function(controllerName) {
        if (!controllers.hasOwnProperty(controllerName)) {
            throw new Error(`ERROR: Controller ${controllerName} is not registered.`);
        }
        return controllers[controllerName];
    };

    this.register = function(controllerName, controllerFn) {
        controllers[controllerName] = controllerFn;
    };
});