import jetpack from 'fs-jetpack';
import dateFormat from 'dateformat';

export default function() {
    const bar = '='.repeat(80);

    let logger = this,
        callbacks = {
            log: [],
            info: [],
            warn: [],
            error: []
        },
        messages,
        stream;

    let invokeCallbacks = function(key, msg) {
        callbacks[key].forEach(fn => fn(msg));
    };

    this.init = function(name = 'log', path = 'logs') {
        let dateStr = dateFormat(new Date(), 'yyyy_mm_dd_HH_MM'),
            filePath = jetpack.path(`${path}/${name}_${dateStr}.txt`);
        jetpack.dir(path);
        stream = jetpack.createWriteStream(filePath, { flags: 'a+' });
        messages = [];
        logger.log(`${bar}\nSession started at ${new Date()}\n`);
    };

    this.close = function() {
        logger.log(`\nSession terminated at ${new Date()}\n${bar}\n\n`);
        stream.end();
        messages = undefined;
    };

    this.closed = () => !messages;

    this.getMessages = () => messages;

    this.addCallback = function(key, callback) {
        callbacks[key].push(callback);
    };

    this.removeCallback = function(key, callback) {
        callbacks[key].remove(callback);
    };

    this.log = function(msg) {
        messages.push(msg);
        stream.write(msg + '\n');
        invokeCallbacks('log', msg);
    };

    this.info = function(msg) {
        logger.log(`[INFO] ${msg}`);
        invokeCallbacks('info', msg);
    };

    this.warn = function(msg) {
        logger.log(`[WARN] ${msg}`);
        invokeCallbacks('warn', msg);
    };

    this.error = function(msg) {
        logger.log(`[ERROR] ${msg}`);
        invokeCallbacks('error', msg);
    };
};
