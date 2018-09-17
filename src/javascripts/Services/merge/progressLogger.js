import logger from '../../helpers/logger';

ngapp.service('progressLogger', function(progressService) {
    const bar = '='.repeat(60);

    let logMessage = function(level, msg, v) {
        logger[level](msg);
        if (!v) progressService.logMessage(level, msg);
    };

    this.init = logger.init;
    this.close = logger.close;
    this.log = (msg, v) => logMessage('log', msg, v);
    this.info = (msg, v) => logMessage('info', msg, v);
    this.warn = (msg, v) => logMessage('warn', msg, v);
    this.error = (msg, v) => logMessage('error', msg, v);
    this.progress = (msg, skipAdd) => {
        logMessage('log', `\r\n${msg}\r\n${bar}`);
        if (!skipAdd) progressService.addProgress(1);
        progressService.progressMessage(msg);
    };
});
