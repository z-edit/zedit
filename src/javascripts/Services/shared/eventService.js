ngapp.service('eventService', function() {
    this.onRegainFocus = function(callback, delay) {
        let focusTimeout, lostFocus = false;

        window.onblur = () => {
            focusTimeout = setTimeout(() => lostFocus = true, delay);
        };

        window.onfocus = () => {
            if (focusTimeout) clearTimeout(focusTimeout);
            if (lostFocus) callback();
        };
    };

    this.beforeClose = function(callback) {
        window.onbeforeunload = function(e) {
            if (remote.app.forceClose) return;
            e.returnValue = false;
            callback();
        };
    };
});