import { ipcRenderer, remote } from 'electron';
import jetpack from 'fs-jetpack';
import fh from './helpers/fileHelpers';
import './polyfills';

window.xelib = remote.getGlobal('xelib');

let deserialize = function(str) {
    return JSON.parse(str, function(key, value) {
        if (key === '' || (typeof value !== 'string')) return value;

        let expr = /function[^\(]*\(([^\)]*)\)[^\{]*{([^\}]*)\}/,
            match = value.match(expr);
        if (!match) return value;

        let args = match[1].split(',').map(function(arg) {
            return arg.replace(/\s+/, '');
        });
        return new Function(args, match[2]);
    });
};

let invokeCallback = function(callbackName, args) {
    ipcRenderer.send('worker-callback', {
        callbackName: callbackName,
        args: args
    });
};

let log = function(message) {
    ipcRenderer.send('worker-message', message);
};

let getWorkerArgs = function(options) {
    let args = {
        data: options.data,
        fh: fh,
        log: log
    };
    options.callbacks.forEach(function(callbackName) {
        args[callbackName] = function() {
            invokeCallback(callbackName, arguments);
        };
    });
    return args;
};

let runWorker = function(payload) {
    let options = deserialize(payload),
        filename = options.filename;
    if (!jetpack.exists(filename))
        throw new Error(`File ${filename} not found in ${jetpack.cwd()}`);

    log(`Starting worker: ${filename}`);
    let workerCode = jetpack.read(filename),
        args = getWorkerArgs(options),
        workerFn = new Function(...Object.keys(args), workerCode);
    workerFn(...Object.values(args));
    log('Worker done!');
};

window.onload = function () {
    ipcRenderer.on('run-worker', (e, payload) => {
        try {
            runWorker(payload);
            ipcRenderer.send('worker-done');
        } catch(e) {
            log(e.stack);
            ipcRenderer.send('worker-error', e.stack);
        }
    });
};