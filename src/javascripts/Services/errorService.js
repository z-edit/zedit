ngapp.service('errorService', function($exceptionHandler) {
    let service = this;

    this.handleException = $exceptionHandler;

    this.try = function(callback) {
        try {
            callback();
            return true;
        } catch(x) {
            service.handleException(x)
        }
    };
});
