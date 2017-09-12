import { xelib } from './lib';

// UTILITY METHODS
Object.assign(xelib, {
    Hex: function(n, padding = 8) {
        let str = Number(n).toString(16).toUpperCase();
        while (str.length < padding) str = '0' + str;
        return str;
    },
    WithHandle: function(handle, callback) {
        try {
            callback(handle);
        } finally {
            xelib.Release(handle);
        }
    },
    WithHandles: function(handles, callback) {
        try {
            callback(handles);
        } finally {
            handles.forEach(xelib.Release);
        }
    }
});
