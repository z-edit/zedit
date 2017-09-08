import { xelib } from './lib';

// RECORD VALUE METHODS
Object.assign(xelib, {
    EditorID: function(_id, noException = false) {
        return xelib.GetValue(_id, 'EDID', noException);
    },
    FullName: function(_id, noException = false) {
        return xelib.GetValue(_id, 'FULL', noException);
    },
    Translate: function(_id, vector) {
        let position = xelib.GetElement(_id, 'DATA\\Position');
        ['X', 'Y', 'Z'].forEach(function(coord) {
            if (vector.hasOwnProperty(coord)) {
                let newValue = xelib.GetFloatValue(position, coord) + vector[coord];
                xelib.SetFloatValue(position, coord, newValue);
            }
        });
    },
    Rotate: function(_id, vector) {
        let rotation = xelib.GetElement(_id, 'DATA\\Rotation');
        ['X', 'Y', 'Z'].forEach(function(coord) {
            if (vector.hasOwnProperty(coord)) {
                let newValue = xelib.GetFloatValue(rotation, coord) + vector[coord];
                xelib.SetFloatValue(rotation, coord, newValue);
            }
        });
    },
    GetRecordFlag: function(_id, name) {
        return xelib.GetFlag(_id, 'Record Header\\Record Flags', name);
    },
    SetRecordFlag: function(_id, name, enabled) {
        xelib.SetFlag(_id, 'Record Header\\Record Flags', name, enabled);
    },
    HexFormID: function(_id, local = false) {
        let result = xelib.GetFormID(_id, local).toString(16).toUpperCase();
        while (result.length < 8) result = '0' + result;
        return result;
    }
});