// ELEMENT VALUE METHODS
xelib.Name = function(_id) {
    return GetStringValue(_id, 'Name');
};
xelib.LongName = function(_id) {
    return GetStringValue(_id, 'LongName');
};
xelib.DisplayName = function(_id) {
    return GetStringValue(_id, 'DisplayName');
};
xelib.Path = function(_id) {
    return GetString(function(_len) {
        if (!lib.Path(_id, false, false, _len))
            Fail(`Path failed on ${_id}`);
    });
};
xelib.LongPath = function(_id) {
    return GetString(function(_len) {
        if (!lib.Path(_id, false, true, _len))
            Fail(`Path failed on ${_id}`);
    });
};
xelib.LocalPath = function(_id) {
    return GetString(function(_len) {
        if (!lib.Path(_id, true, false, _len))
            Fail(`Path failed on ${_id}`);
    });
};
xelib.Signature = function(_id) {
    return GetStringValue(_id, 'Signature');
};
xelib.SortKey = function(_id) {
    return GetStringValue(_id, 'SortKey');
};
xelib.ElementType = function(_id, asString = false) {
    return GetEnumValue(_id, 'ElementType', asString && elementTypes);
};
xelib.DefType = function(_id, asString = false) {
    return GetEnumValue(_id, 'DefType', asString && defTypes);
};
xelib.SmashType = function(_id, asString = false) {
    return GetEnumValue(_id, 'SmashType', asString && smashTypes);
};
xelib.GetValue = function(_id, path = '', noException = false) {
    return GetString(function(_len) {
        if (!lib.GetValue(_id, wcb(path), _len))
            if (!noException) Fail(`Failed to get element value at: ${elementContext(_id, path)}`);
    });
};
xelib.SetValue = function(_id, path, value) {
    if (value === undefined) {
        value = path;
        path = '';
    }
    if (!lib.SetValue(_id, wcb(path), wcb(value)))
        Fail(`Failed to set element value at: ${elementContext(_id, path)}`);
};
xelib.GetIntValue = function(_id, path) {
    return GetNativeValue(_id, path, 'GetIntValue', PInteger).readInt32LE();
};
xelib.SetIntValue = function(_id, path, value) {
    SetNativeValue(_id, path, 'SetIntValue', value);
};
xelib.GetUIntValue = function(_id, path) {
    return GetNativeValue(_id, path, 'GetUIntValue', PCardinal).readUInt32LE();
};
xelib.SetUIntValue = function(_id, path, value) {
    SetNativeValue(_id, path, 'SetUIntValue', value);
};
xelib.GetFloatValue = function(_id, path) {
    return GetNativeValue(_id, path, 'GetFloatValue', PDouble).readDoubleLE();
};
xelib.SetFloatValue = function(_id, path, value) {
    SetNativeValue(_id, path, 'SetFloatValue', value);
};
xelib.SetFlag = function(_id, path, name, enabled) {
    if (!lib.SetFlag(_id, wcb(path), wcb(name), enabled))
        Fail(`Failed to set flag value at: ${flagContext(_id, path, name)} to ${enabled}`);
};
xelib.GetFlag = function(_id, path, name) {
    return GetBool(function(_bool) {
        if (!lib.GetFlag(_id, wcb(path), wcb(name), _bool))
            Fail(`Failed to get flag value at: ${flagContext(_id, path, name)}`);
    });
};
xelib.GetEnabledFlags = function(_id, path = '') {
    return GetString(function(_len) {
        if (!lib.GetEnabledFlags(_id, wcb(path), _len))
            Fail(`Failed to get enabled flags at: ${elementContext(_id, path)}`);
    }).split(',');
};
xelib.SetEnabledFlags = function(_id, path, flags) {
    if (!lib.SetEnabledFlags(_id, wcb(path), wcb(flags.join(','))))
        Fail(`Failed to set enabled flags at: ${elementContext(_id, path)}`);
};
xelib.GetAllFlags = function(_id, path) {
    return GetString(function(_len) {
        if (!lib.GetAllFlags(_id, wcb(path), _len))
            Fail(`Failed to get all flags at: ${elementContext(_id, path)}`);
    }).split(',');
};