ngapp.service('progressLogger', function(progressService) {
    let {progressMessage, progressError, addProgress, progressTitle,
         showProgress, logMessage, allowClose} = progressService;

    let progressLogger;

    const bar = '='.repeat(60);

    let message = function(level, msg, v) {
        progressLogger[level](msg);
        if (!v) logMessage(level, msg);
    };

    this.init = (logName, path) => {
        progressLogger = new Logger();
        progressLogger.init(logName, path);
    };

    this.log = (msg, v) => message('log', msg, v);
    this.info = (msg, v) => message('info', msg, v);
    this.warn = (msg, v) => message('warn', msg, v);
    this.error = (msg, v) => message('error', msg, v);

    this.done = (title) => {
        if (title) progressTitle(title);
        progressMessage('All Done!');
        addProgress(1);
    };

    this.close = (progressAllowClose = true) => {
        if (progressAllowClose) allowClose();
        progressLogger.close();
    };

    this.fatalError = (err, message, title) => {
        progressTitle(title || message);
        progressMessage('Error');
        progressError(`${message}:\n${err.stack}`);
    };

    let tryTask = (task, fn) => {
        try {
            fn();
            this.done(`Done ${task}`);
        } catch (err) {
            this.fatalError(err, `Error ${task}`);
        } finally {
            this.close();
        }
    };

    this.run = (logName, path, progressOpts, fn) => {
        this.init(logName, path);
        showProgress(Object.assign({
            determinate: true,
            message: 'Initializing...',
            logName: logName,
            current: 0
        }, progressOpts));
        tryTask(progressOpts.title.toLowerCase(), fn);
    };

    this.progress = (msg, skipAdd) => {
        message('log', `\r\n${msg}\r\n${bar}`);
        if (!skipAdd) addProgress(1);
        progressMessage(msg);
    };
});
