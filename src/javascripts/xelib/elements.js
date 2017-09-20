import { lib } from './lib';
import { applyEnums, elementContext, arrayItemContext, Fail, GetArray, GetBool,
         GetEnumValue, GetHandle, GetInteger, GetStringArray, wcb } from './helpers';

// ENUMERATIONS
const elementTypes = ['etFile', 'etMainRecord', 'etGroupRecord', 'etSubRecord', 'etSubRecordStruct', 'etSubRecordArray', 'etSubRecordUnion', 'etArray', 'etStruct', 'etValue', 'etFlag', 'etStringListTerminator', 'etUnion', 'etStructChapter'];
const defTypes = ['dtRecord', 'dtSubRecord', 'dtSubRecordArray', 'dtSubRecordStruct', 'dtSubRecordUnion', 'dtString', 'dtLString', 'dtLenString', 'dtByteArray', 'dtInteger', 'dtIntegerFormater', 'dtIntegerFormaterUnion', 'dtFlag', 'dtFloat', 'dtArray', 'dtStruct', 'dtUnion', 'dtEmpty', 'dtStructChapter'];
const smashTypes = ['stUnknown', 'stRecord', 'stString', 'stInteger', 'stFlag', 'stFloat', 'stStruct', 'stUnsortedArray', 'stUnsortedStructArray', 'stSortedArray', 'stSortedStructArray', 'stByteArray', 'stUnion'];
const valueTypes = ['vtUnknown', 'vtBytes', 'vtNumber', 'vtString', 'vtText', 'vtReference', 'vtFlags', 'vtEnum', 'vtColor', 'vtArray', 'vtStruct'];

applyEnums(xelib, elementTypes, 'elementTypes');
applyEnums(xelib, defTypes, 'defTypes');
applyEnums(xelib, smashTypes, 'smashTypes');
applyEnums(xelib, valueTypes, 'valueTypes');

// ELEMENT HANDLING METHODS
Object.assign(xelib, {
    HasElement: function(_id, path = '') {
        return GetBool(function(_bool) {
            if (!lib.HasElement(_id, wcb(path), _bool))
                Fail(`Failed to check if element exists at: ${elementContext(_id, path)}`);
        });
    },
    GetElement: function(_id, path = '') {
        return GetHandle((_res) => lib.GetElement(_id, wcb(path), _res));
    },
    GetElementEx: function(_id, path = '') {
        return GetHandle(function(_res) {
            if (!lib.GetElement(_id, wcb(path), _res))
                Fail(`Failed to get element at: ${elementContext(_id, path)}`);
        });
    },
    AddElement: function(_id, path = '') {
        return GetHandle(function(_res) {
            if (!lib.AddElement(_id, wcb(path), _res))
                Fail(`Failed to create new element at: ${elementContext(_id, path)}`);
        });
    },
    AddElementValue: function(_id, path, value) {
        return GetHandle(function(_res) {
            if (!lib.AddElementValue(_id, wcb(path), wcb(value), _res))
                Fail(`Failed to create new element at: ${elementContext(_id, path)}, with value: ${value}`);
        });
    },
    RemoveElement: function(_id, path = '') {
        lib.RemoveElement(_id, wcb(path));
    },
    RemoveElementEx: function(_id, path = '') {
        if (!lib.RemoveElement(_id, wcb(path)))
            Fail(`Failed to remove element at: ${elementContext(_id, path)}`);
    },
    RemoveElementOrParent: function(_id) {
        if (!lib.RemoveElementOrParent(_id))
            Fail(`Failed to remove element ${_id}`);
    },
    SetElement: function(_id1, _id2) {
        return GetHandle(function(_res) {
            if (!lib.SetElement(_id1, _id2, _res))
                Fail(`Failed to set element at ${_id2} to ${_id1}`);
        });
    },
    GetElements: function(_id = 0, path = '', sort = false) {
        return GetArray(function(_len) {
            if (!lib.GetElements(_id, wcb(path), sort, _len))
                Fail(`Failed to get child elements at: ${elementContext(_id, path)}`);
        });
    },
    GetDefNames: function(_id) {
        return GetStringArray(function(_len) {
            if (!lib.GetDefNames(_id, _len))
                Fail(`Failed to get def names for: ${_id}`);
        });
    },
    GetAddList: function(_id) {
        return GetStringArray(function(_len) {
            if (!lib.GetAddList(_id, _len))
                Fail(`Failed to get add list for: ${_id}`);
        });
    },
    GetLinksTo: function(_id, path) {
        return GetHandle((_res) => lib.GetLinksTo(_id, wcb(path), _res));
    },
    SetLinksTo: function(id, path, id2) {
        if (!lib.SetLinksTo(id, wcb(path), id2))
            Fail(`Failed to set reference at: ${elementContext(id, path)}`);
    },
    GetLinksToEx: function(_id, path) {
        return GetHandle(function(_res) {
            if (!lib.GetLinksTo(_id, wcb(path), _res))
                Fail(`Failed to get reference at: ${elementContext(_id, path)}`);
        });
    },
    GetContainer: function(_id) {
        return GetHandle((_res) => lib.GetContainer(_id, _res));
    },
    GetContainerEx: function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetContainer(_id, _res))
                Fail(`Failed to get container for: ${_id}`);
        });
    },
    GetElementFile: function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetElementFile(_id, _res))
                Fail(`Failed to get element file for: ${_id}`);
        });
    },
    ElementCount: function(_id) {
        return GetInteger(function(_res) {
            if (!lib.ElementCount(_id, _res))
                Fail(`Failed to get element count for ${_id}`);
        });
    },
    ElementEquals: function(_id, _id2) {
        return GetBool(function(_bool) {
            if (!lib.ElementEquals(_id, _id2, _bool))
                Fail(`Failed to check element equality for ${_id} and ${_id2}`);
        });
    },
    ElementMatches: function(_id, path, value) {
        return GetBool(function(_bool) {
            if (!lib.ElementMatches(_id, wcb(path), wcb(value), _bool))
                Fail(`Failed to check element matches for ${_id}: ${path}, ${value}`);
        });
    },
    HasArrayItem: function(_id, path, subpath, value) {
        return GetBool(function(_bool) {
            lib.HasArrayItem(_id, wcb(path), wcb(subpath), wcb(value), _bool);
        });
    },
    GetArrayItem: function(_id, path, subpath, value) {
        return GetHandle(function(_res) {
            lib.GetArrayItem(_id, wcb(path), wcb(subpath), wcb(value), _res);
        });
    },
    AddArrayItem: function(_id, path, subpath, value) {
        return GetHandle(function(_res) {
            if (!lib.AddArrayItem(_id, wcb(path), wcb(subpath), wcb(value), _res))
                Fail(`Failed to add array item to ${arrayItemContext(path, subpath, value)}`);
        });
    },
    RemoveArrayItem: function(_id, path, subpath, value) {
        return GetHandle(function(_res) {
            lib.RemoveArrayItem(_id, wcb(path), wcb(subpath), wcb(value), _res);
        });
    },
    MoveArrayItem: function(_id, index) {
        if (!lib.MoveArrayItem(_id, index))
            Fail(`Failed to move array item ${_id} to ${index}`);
    },
    CopyElement: function(_id, _id2, asNew = false) {
        return GetHandle(function(_res) {
            if (!lib.CopyElement(_id, _id2, asNew, _res))
                Fail(`Failed to copy element from ${_id} to ${_id2}`);
        });
    },
    FindNextElement: function(_id, search, byPath, byValue) {
        return GetHandle(function(_res) {
            lib.FindNextElement(_id, wcb(search), byPath, byValue, _res);
        });
    },
    FindPreviousElement: function(_id, search, byPath, byValue) {
        return GetHandle(function(_res) {
            lib.FindPreviousElement(_id, wcb(search), byPath, byValue, _res);
        });
    },
    GetSignatureAllowed: function(_id, signature) {
        return GetBool(function(_bool) {
            if (!lib.GetSignatureAllowed(_id, wcb(signature), _bool))
                Fail(`Failed to check if signature ${signature} is allowed on ${_id}`);
        });
    },
    GetAllowedSignatures: function(_id) {
        return GetStringArray(function(_len) {
            if (!lib.GetAllowedSignatures(_id, _len))
                Fail(`Failed to get allowed signatures for ${_id}`);
        });
    },
    GetIsModified: function(_id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsModified(_id, _bool))
                Fail(`Failed to get is modified for ${_id}`);
        });
    },
    GetIsEditable: function(_id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsEditable(_id, _bool))
                Fail(`Failed to get is editable for ${_id}`);
        });
    },
    GetIsRemoveable: function(_id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsRemoveable(_id, _bool))
                Fail(`Failed to get is removeable for ${_id}`);
        });
    },
    GetCanAdd: function(_id) {
        return GetBool(function(_bool) {
            if (!lib.GetCanAdd(_id, _bool))
                Fail(`Failed to get can add for ${_id}`);
        });
    },
    ElementType: function(_id, asString = false) {
        return GetEnumValue(_id, 'ElementType', asString && elementTypes);
    },
    DefType: function(_id, asString = false) {
        return GetEnumValue(_id, 'DefType', asString && defTypes);
    },
    SmashType: function(_id, asString = false) {
        return GetEnumValue(_id, 'SmashType', asString && smashTypes);
    },
    ValueType: function(_id, asString = false) {
        return GetEnumValue(_id, 'ValueType', asString && valueTypes);
    },
    IsSorted: function(_id) {
        return GetBool(function(_bool) {
            if (!lib.IsSorted(_id, _bool))
                Fail(`Failed to get is sorted for ${_id}`);
        });
    },
    IsFlags: function(_id) {
        return xelib.ValueType(_id) === xelib.vtFlags;
    }
});
