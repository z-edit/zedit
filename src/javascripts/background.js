import { ipcRenderer, remote } from 'electron';
import fh from './helpers/fileHelpers';

// TODO: uncomment
// window.xelib = remote.getGlobal('xelib');

let debug = true;

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
    return ipcRenderer.sendSync('worker-callback', {
        callbackName: callbackName,
        args: args
    });
};

let runWorker = function(data) {
    console.log(`Received worker data: ${data}`);
    let options = deserialize(data);
    if (!jetpack.exists(options.filename))
        throw new Error(`File ${options.filename} not found in ${jetpack.cwd()}`);

    console.log(`Starting worker: ${options.filename}`);
    let workerCode = buildWorkerCode(options),
        workerFn = new Function('fh', 'invokeCallback', workerCode);
    workerFn(fh, invokeCallback);
    console.log('Worker done!')
};

window.onload = function () {
    ipcRenderer.on('background-start', (data) => {
        try {
            runWorker(data);
            ipcRenderer.send('worker-response');
        } catch(e) {
            ipcRenderer.send('worker-response', e);
        }
    });
};