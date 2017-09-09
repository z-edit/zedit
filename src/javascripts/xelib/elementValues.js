import { lib, xelib } from './lib';
import { elementContext, Fail, flagContext, GetNativeValue, GetString,
         GetStringValue, SetNativeValue, wcb } from './helpers';
import { PCardinal, PInteger, PDouble } from './types';

// ELEMENT VALUE METHODS
Object.assign(xelib, {
    Name: function(_id) {
        return GetStringValue(_id, 'Name');
    },
    LongName: function(_id) {
        return GetStringValue(_id, 'LongName');
    },
    DisplayName: function(_id) {
        return GetStringValue(_id, 'DisplayName');
    },
    Path: function(_id) {
        return GetString(function(_len) {
            if (!lib.Path(_id, true, false, _len))
                Fail(`Path failed on ${_id}`);
        });
    },
    LongPath: function(_id) {
        return GetString(function(_len) {
            if (!lib.Path(_id, false, false, _len))
                Fail(`Path failed on ${_id}`);
        });
    },
    LocalPath: function(_id) {
        return GetString(function(_len) {
            if (!lib.Path(_id, false, true, _len))
                Fail(`Path failed on ${_id}`);
        });
    },
    Signature: function(_id) {
        return GetStringValue(_id, 'Signature');
    },
    SortKey: function(_id) {
        return GetStringValue(_id, 'SortKey');
    },
    GetValue: function(_id, path = '') {
        return GetString((_len) => lib.GetValue(_id, wcb(path), _len));
    },
    GetValueEx: function(_id, path = '') {
        return GetString(function(_len) {
            if (!lib.GetValue(_id, wcb(path), _len))
                Fail(`Failed to get element value at: ${elementContext(_id, path)}`);
        });
    },
    SetValue: function(_id, path, value) {
        if (value === undefined) {
            value = path;
            path = '';
        }
        if (!lib.SetValue(_id, wcb(path), wcb(value)))
            Fail(`Failed to set element value at: ${elementContext(_id, path)}`);
    },
    GetIntValue: function(_id, path) {
        return GetNativeValue(_id, path, 'GetIntValue', PInteger).readInt32LE();
    },
    SetIntValue: function(_id, path, value) {
        SetNativeValue(_id, path, 'SetIntValue', value);
    },
    GetUIntValue: function(_id, path) {
        return GetNativeValue(_id, path, 'GetUIntValue', PCardinal).readUInt32LE();
    },
    SetUIntValue: function(_id, path, value) {
        SetNativeValue(_id, path, 'SetUIntValue', value);
    },
    GetFloatValue: function(_id, path) {
        return GetNativeValue(_id, path, 'GetFloatValue', PDouble).readDoubleLE();
    },
    SetFloatValue: function(_id, path, value) {
        SetNativeValue(_id, path, 'SetFloatValue', value);
    },
    SetFlag: function(_id, path, name, enabled) {
        if (!lib.SetFlag(_id, wcb(path), wcb(name), enabled))
            Fail(`Failed to set flag value at: ${flagContext(_id, path, name)} to ${enabled}`);
    },
    GetFlag: function(_id, path, name) {
        return GetBool(function(_bool) {
            if (!lib.GetFlag(_id, wcb(path), wcb(name), _bool))
                Fail(`Failed to get flag value at: ${flagContext(_id, path, name)}`);
        });
    },
    GetEnabledFlags: function(_id, path = '') {
        return GetString(function(_len) {
            if (!lib.GetEnabledFlags(_id, wcb(path), _len))
                Fail(`Failed to get enabled flags at: ${elementContext(_id, path)}`);
        }).split(',');
    },
    SetEnabledFlags: function(_id, path, flags) {
        if (!lib.SetEnabledFlags(_id, wcb(path), wcb(flags.join(','))))
            Fail(`Failed to set enabled flags at: ${elementContext(_id, path)}`);
    },
    GetAllFlags: function(_id, path = '') {
        return GetString(function(_len) {
            if (!lib.GetAllFlags(_id, wcb(path), _len))
                Fail(`Failed to get all flags at: ${elementContext(_id, path)}`);
        }).split(',');
    },
    GetEnumOptions: function(_id, path = '') {
        return GetString(function(_len) {
            if (!lib.GetEnumOptions(_id, wcb(path), _len))
                Fail(`Failed to get all enum options at: ${elementContext(_id, path)}`);
        }).split(',');
    },
});
