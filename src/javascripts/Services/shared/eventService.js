ngapp.service('eventService', function() {
    let service = this;

    // PUBLIC API
    this.onRegainFocus = function(callback, delay) {
        let focusTimeout, lostFocus = false;

        window.onblur = () => {
            focusTimeout = setTimeout(() => lostFocus = true, delay);
        };

        window.onfocus = () => {
            if (focusTimeout) clearTimeout(focusTimeout);
            if (lostFocus) callback();
            lostFocus = false;
        };
    };

    this.beforeClose = function(callback) {
        window.onbeforeunload = function(e) {
            if (remote.app.forceClose) return;
            e.returnValue = false;
            callback();
        };
    };

    this.addEventListener = function(scope, element, event, fn) {
        element.addEventListener(event, fn);
        scope.$on('$destroy', function() {
            element.removeEventListener(event, fn);
        });
    };

    this.handleEvents = function(scope, element, events) {
        Object.keys(events).forEach(function(event) {
            var fn = events[event];
            service.addEventListener(scope, element, event, fn);
        });
    };
});
