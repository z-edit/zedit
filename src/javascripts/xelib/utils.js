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
    },
    CreateHandleGroup: function() {
        if (xelib.HandleGroup) throw 'Another handle group is already active!';
        xelib.HandleGroup = [];
    },
    FreeHandleGroup: function() {
        if (!xelib.HandleGroup) return;
        xelib.HandleGroup.forEach((h) => xelib.Release(h, true));
        xelib.HandleGroup = undefined;
    },
    OutsideHandleGroup: function(callback) {
        let handleGroup = xelib.HandleGroup;
        try {
            xelib.HandleGroup = undefined;
            callback();
        } finally {
            xelib.HandleGroup = handleGroup;
        }
    }
});
