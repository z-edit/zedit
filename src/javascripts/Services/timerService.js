ngapp.service('timerService', function() {
    let service = this,
        timers = {};

    let millisecondsAgo = function(ms) {
        return new Date((new Date()).getTime() - ms);
    };

    this.start = function(timerName) {
        timers[timerName] = new Date();
    };

    this.pause = function(timerName) {
        timers[timerName] = {
            started: timers[timerName],
            paused: new Date()
        };
    };

    this.resume = function(timerName) {
        timers[timerName] = millisecondsAgo(timers[timerName].pausedAt);
    };

    this.getSeconds = function(timerName) {
        let timer = timers[timerName];
        return (timer.pausedAt || new Date() - timer) / 1000.0;
    };

    this.getSecondsStr = function(timerName) {
        return `${service.getSeconds(timerName).toFixed(3)}s`;
    }
});