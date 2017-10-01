ngapp.service('errorService', function() {
    let service = this;

    // default exception handler, should be overridden by view
    this.handleException = (exception) => alert(exception);

    this.try = function(callback) {
        try { callback() } catch(x) { service.handleException(x) }
    };
});
