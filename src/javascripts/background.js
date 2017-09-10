import { ipcRenderer, remote } from 'electron';
import fh from './helpers/fileHelpers';
import jetpack from 'fs-jetpack';

window.xelib = remote.getGlobal('xelib');

let alphabet = 'abcdefghijklmnopqrstuvwxyz';

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

let buildCallbacksCode = function(callbacks) {
    return callbacks.map(function(key) {
        return `let ${key} = (...args) => invokeCallback('${key}', args);`;
    }).join('\r\n');
};

let codeSection = function(label, code) {
    return [`// ${label.toUpperCase()}`, code, ''].join('\r\n');
};

let buildWorkerCode = function(options) {
    return [
        codeSection('callbacks', buildCallbacksCode(options.callbacks)),
        codeSection('worker', jetpack.read(options.filename))
    ].join('\r\n');
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

let runWorker = function(payload) {
    let options = deserialize(payload);
    if (!jetpack.exists(options.filename))
        throw new Error(`File ${options.filename} not found in ${jetpack.cwd()}`);

    log(`Starting worker: ${options.filename}`);
    let workerCode = buildWorkerCode(options),
        workerFn = new Function('data', 'fh', 'invokeCallback', 'log', workerCode);
    log(workerCode);
    workerFn(options.data, fh, invokeCallback, log);
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