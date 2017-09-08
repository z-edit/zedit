import {xelib} from './lib';

// RECORD VALUE METHODS
xelib.EditorID = function(_id, noException = false) {
    return xelib.GetValue(_id, 'EDID', noException);
};
xelib.FullName = function(_id, noException = false) {
    return xelib.GetValue(_id, 'FULL', noException);
};
xelib.Translate = function(_id, vector) {
    let position = xelib.GetElement(_id, 'DATA\\Position');
    ['X', 'Y', 'Z'].forEach(function(coord) {
        if (vector.hasOwnProperty(coord)) {
            let newValue = xelib.GetFloatValue(position, coord) + vector[coord];
            xelib.SetFloatValue(position, coord, newValue);
        }
    });
};
xelib.Rotate = function(_id, vector) {
    let rotation = xelib.GetElement(_id, 'DATA\\Rotation');
    ['X', 'Y', 'Z'].forEach(function(coord) {
        if (vector.hasOwnProperty(coord)) {
            let newValue = xelib.GetFloatValue(rotation, coord) + vector[coord];
            xelib.SetFloatValue(rotation, coord, newValue);
        }
    });
};
xelib.GetRecordFlag = function(_id, name) {
    return xelib.GetFlag(_id, 'Record Header\\Record Flags', name);
};
xelib.SetRecordFlag = function(_id, name, enabled) {
    xelib.SetFlag(_id, 'Record Header\\Record Flags', name, enabled);
};
