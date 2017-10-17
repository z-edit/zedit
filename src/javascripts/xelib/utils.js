// UTILITY METHODS
let releaseHandles = function(item) {
    if (item.constructor === Array) {
        item.forEach(releaseHandles);
    } else {
        xelib.Release(item);
    }
};

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
            releaseHandles(handles);
        }
    },
    CreateHandleGroup: function() {
        if (xelib.HandleGroup) throw 'Another handle group is already active!';
        xelib.HandleGroup = [];
    },
    FreeHandleGroup: function() {
        if (!xelib.HandleGroup) return;
        xelib.HandleGroup.forEach(xelib.Release);
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
