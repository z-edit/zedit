// UTILITY METHODS
xelib.IntToHex = function(n, padding = 8) {
    let str = Number(n).toString(16).toUpperCase();
    while (str.length < padding) str = '0' + str;
    return str;
};
xelib.WithHandle = function(handle, callback) {
    try {
        callback(handle);
    } finally {
        xelib.Release(handle);
    }
};
xelib.WithHandles = function(handles, callback) {
    try {
        callback(handles);
    } finally {
        handles.forEach(xelib.Release);
    }
};