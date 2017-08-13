// ENUMERATIONS
var sortBy = {
    'None': 0,
    'FormID': 1,
    'EditorID': 2,
    'Name': 3
};

// META METHODS
xelib.Initialize = function() {
    lib.InitXEdit();
};
xelib.Finalize = function() {
    lib.CloseXEdit();
};
xelib.GetGlobal = function(key) {
    return GetString(function(_len) {
        if (!lib.GetGlobal(wcb(key), _len))
            Fail('GetGlobal failed.');
    });
};
xelib.GetGlobals = function() {
    return GetString(function(_len) {
        if (!lib.GetGlobals(_len))
            Fail('GetGlobals failed.');
    });
};
xelib.SetSortMode = function(sort, reverse) {
    if (!lib.SetSortMode(sortBy[sort], reverse))
        Fail(`Failed to set sort mode to ${sort} ${reverse ? 'ASC' : 'DESC'}`)
};
xelib.Release = function(_id) {
    if (!lib.Release(_id))
        Fail(`Failed to release interface #${_id}`);
};
xelib.Switch = function(_id, _id2) {
    if (!lib.Switch(_id, _id2))
        Fail(`Failed to switch interface #${_id} and #${_id2}`);
};
xelib.GetDuplicateHandles = function(_id) {
    return GetArray(function(_len) {
        if (!lib.GetDuplicateHandles(_id, _len))
            Fail(`Failed to get duplicate handles for: ${_id}`);
    });
};
xelib.ResetStore = function() {
    if (!lib.ResetStore())
        Fail('Failed to reset interface store');
};