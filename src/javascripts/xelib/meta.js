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
    Initialize: function(libPath) {
        lib.InitXEdit(libPath);
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
    Release: function(id) {
        lib.Release(id);
    },
    ReleaseNodes: function(id) {
        lib.ReleaseNodes(id);
    },
    Switch: function(id, id2) {
        if (!lib.Switch(id, id2))
            Fail(`Failed to switch interface #${id} and #${id2}`);
    },
    GetDuplicateHandles: function(id) {
        return GetArray(function(_len) {
            if (!lib.GetDuplicateHandles(id, _len))
                Fail(`Failed to get duplicate handles for: ${id}`);
        });
    },
    ResetStore: function() {
        if (!lib.ResetStore())
            Fail('Failed to reset interface store');
    }
});
