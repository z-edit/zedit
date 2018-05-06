ngapp.service('errorService', function($exceptionHandler) {
    let service = this;

    this.handleException = $exceptionHandler;

    this.try = function(callback) {
        try { callback() } catch(x) { service.handleException(x) }
    };
});
