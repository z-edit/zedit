import { lib } from './lib';
import { Fail, GetArray, GetString, wcb } from './helpers';

// ENUMERATIONS
let sortBy = {
    'None': 0,
    'FormID': 1,
    'EditorID': 2,
    'Name': 3
};

// META METHODS
Object.assign(xelib, {
    Initialize: function() {
        lib.InitXEdit();
    },
    Finalize: function() {
        lib.CloseXEdit();
    },
    GetGlobal: function(key) {
        return GetString(function(_len) {
            if (!lib.GetGlobal(wcb(key), _len))
                Fail('GetGlobal failed.');
        });
    },
    GetGlobals: function() {
        return GetString(function(_len) {
            if (!lib.GetGlobals(_len))
                Fail('GetGlobals failed.');
        });
    },
    SetSortMode: function(mode, reverse) {
        if (!lib.SetSortMode(sortBy[mode], reverse))
            Fail(`Failed to set sort mode to ${mode} ${reverse ? 'ASC' : 'DESC'}`)
    },
    Release: function(_id) {
        lib.Release(_id);
    },
    ReleaseNodes: function(_id) {
        lib.ReleaseNodes(_id);
    },
    Switch: function(_id, _id2) {
        if (!lib.Switch(_id, _id2))
            Fail(`Failed to switch interface #${_id} and #${_id2}`);
    },
    GetDuplicateHandles: function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetDuplicateHandles(_id, _len))
                Fail(`Failed to get duplicate handles for: ${_id}`);
        });
    },
    ResetStore: function() {
        if (!lib.ResetStore())
            Fail('Failed to reset interface store');
    }
});
