ngapp.service('timerService', function() {
    let timers = {};

    this.start = function(timerKey = 'default') {
        timers[timerKey] = new Date();
    };

    this.getSeconds = function(timerKey = 'default') {
        return (new Date() - timers[timerKey]) / 1000.0;
    };
});