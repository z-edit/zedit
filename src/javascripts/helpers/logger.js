import jetpack from 'fs-jetpack';
import dateFormat from 'dateformat';

export default (function() {
    const bar = '='.repeat(50);

    let callbacks = {
            log: {},
            info: {},
            warn: {},
            error: {}
        },
        messages = [],
        stream;

    let invokeCallbacks = function(key, msg) {
        Object.values(callbacks[key]).forEach(fn => fn(msg));
    };

    let logger = {
        init: function(name = 'log') {
            let dateStr = dateFormat(new Date(), 'yyyy_mm_dd_HH_MM'),
                filename = jetpack.path(`logs/${name}_${dateStr}.txt`);
            jetpack.dir('logs');
            stream = jetpack.createWriteStream(filename, { flags: 'a+' });
            logger.log(`${bar}\nSession started at ${new Date()}\n`);
        },
        close: function() {
            logger.log(`\nSession terminated at ${new Date()}\n${bar}\n\n`);
            stream.end();
        },
        addCallback: function(id, callback) {
            callbacks[id] = callback;
        },
        removeCallback: function(id) {
            delete callbacks[id];
        },
        getMessages: function() {
            return messages;
        },
        log: function(msg) {
            messages.push(msg);
            stream.write(msg + '\n');
            invokeCallbacks('log', msg);
        },
        info: function(msg) {
            logger.log(`[INFO] ${msg}`);
            invokeCallbacks('info', msg);
        },
        warn: function(msg) {
            logger.log(`[WARN] ${msg}`);
            invokeCallbacks('warn', msg);
        },
        error: function(msg) {
            logger.log(`[ERROR] ${msg}`);
            invokeCallbacks('error', msg);
        }
    };

    return logger;
})();