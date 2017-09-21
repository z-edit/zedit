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
    HasElement: function(id, path = '') {
        return GetBool(function(_bool) {
            if (!lib.HasElement(id, wcb(path), _bool))
                Fail(`Failed to check if element exists at: ${elementContext(id, path)}`);
        });
    },
    GetElement: function(id, path = '') {
        return GetHandle((_res) => lib.GetElement(id, wcb(path), _res));
    },
    GetElementEx: function(id, path = '') {
        return GetHandle(function(_res) {
            if (!lib.GetElement(id, wcb(path), _res))
                Fail(`Failed to get element at: ${elementContext(id, path)}`);
        });
    },
    AddElement: function(id, path = '') {
        return GetHandle(function(_res) {
            if (!lib.AddElement(id, wcb(path), _res))
                Fail(`Failed to create new element at: ${elementContext(id, path)}`);
        });
    },
    AddElementValue: function(id, path, value) {
        return GetHandle(function(_res) {
            if (!lib.AddElementValue(id, wcb(path), wcb(value), _res))
                Fail(`Failed to create new element at: ${elementContext(id, path)}, with value: ${value}`);
        });
    },
    RemoveElement: function(id, path = '') {
        lib.RemoveElement(id, wcb(path));
    },
    RemoveElementEx: function(id, path = '') {
        if (!lib.RemoveElement(id, wcb(path)))
            Fail(`Failed to remove element at: ${elementContext(id, path)}`);
    },
    RemoveElementOrParent: function(id) {
        if (!lib.RemoveElementOrParent(id))
            Fail(`Failed to remove element ${id}`);
    },
    SetElement: function(id1, id2) {
        return GetHandle(function(_res) {
            if (!lib.SetElement(id1, id2, _res))
                Fail(`Failed to set element at ${id2} to ${id1}`);
        });
    },
    GetElements: function(id = 0, path = '', sort = false) {
        return GetArray(function(_len) {
            if (!lib.GetElements(id, wcb(path), sort, _len))
                Fail(`Failed to get child elements at: ${elementContext(id, path)}`);
        });
    },
    GetDefNames: function(id) {
        return GetStringArray(function(_len) {
            if (!lib.GetDefNames(id, _len))
                Fail(`Failed to get def names for: ${id}`);
        });
    },
    GetAddList: function(id) {
        return GetStringArray(function(_len) {
            if (!lib.GetAddList(id, _len))
                Fail(`Failed to get add list for: ${id}`);
        });
    },
    GetLinksTo: function(id, path) {
        return GetHandle((_res) => lib.GetLinksTo(id, wcb(path), _res));
    },
    SetLinksTo: function(id, path, id2) {
        if (!lib.SetLinksTo(id, wcb(path), id2))
            Fail(`Failed to set reference at: ${elementContext(id, path)}`);
    },
    GetLinksToEx: function(id, path) {
        return GetHandle(function(_res) {
            if (!lib.GetLinksTo(id, wcb(path), _res))
                Fail(`Failed to get reference at: ${elementContext(id, path)}`);
        });
    },
    GetContainer: function(id) {
        return GetHandle((_res) => lib.GetContainer(id, _res));
    },
    GetContainerEx: function(id) {
        return GetHandle(function(_res) {
            if (!lib.GetContainer(id, _res))
                Fail(`Failed to get container for: ${id}`);
        });
    },
    GetElementFile: function(id) {
        return GetHandle(function(_res) {
            if (!lib.GetElementFile(id, _res))
                Fail(`Failed to get element file for: ${id}`);
        });
    },
    ElementCount: function(id) {
        return GetInteger(function(_res) {
            if (!lib.ElementCount(id, _res))
                Fail(`Failed to get element count for ${id}`);
        });
    },
    ElementEquals: function(id, id2) {
        return GetBool(function(_bool) {
            if (!lib.ElementEquals(id, id2, _bool))
                Fail(`Failed to check element equality for ${id} and ${id2}`);
        });
    },
    ElementMatches: function(id, path, value) {
        return GetBool(function(_bool) {
            if (!lib.ElementMatches(id, wcb(path), wcb(value), _bool))
                Fail(`Failed to check element matches for ${id}: ${path}, ${value}`);
        });
    },
    HasArrayItem: function(id, path, subpath, value) {
        return GetBool(function(_bool) {
            lib.HasArrayItem(id, wcb(path), wcb(subpath), wcb(value), _bool);
        });
    },
    GetArrayItem: function(id, path, subpath, value) {
        return GetHandle(function(_res) {
            lib.GetArrayItem(id, wcb(path), wcb(subpath), wcb(value), _res);
        });
    },
    AddArrayItem: function(id, path, subpath, value) {
        return GetHandle(function(_res) {
            if (!lib.AddArrayItem(id, wcb(path), wcb(subpath), wcb(value), _res))
                Fail(`Failed to add array item to ${arrayItemContext(path, subpath, value)}`);
        });
    },
    RemoveArrayItem: function(id, path, subpath, value) {
        return GetHandle(function(_res) {
            lib.RemoveArrayItem(id, wcb(path), wcb(subpath), wcb(value), _res);
        });
    },
    MoveArrayItem: function(id, index) {
        if (!lib.MoveArrayItem(id, index))
            Fail(`Failed to move array item ${id} to ${index}`);
    },
    CopyElement: function(id, id2, asNew = false) {
        return GetHandle(function(_res) {
            if (!lib.CopyElement(id, id2, asNew, _res))
                Fail(`Failed to copy element ${id} to ${id2}`);
        });
    },
    FindNextElement: function(id, search, byPath, byValue) {
        return GetHandle(function(_res) {
            lib.FindNextElement(id, wcb(search), byPath, byValue, _res);
        });
    },
    FindPreviousElement: function(id, search, byPath, byValue) {
        return GetHandle(function(_res) {
            lib.FindPreviousElement(id, wcb(search), byPath, byValue, _res);
        });
    },
    GetSignatureAllowed: function(id, signature) {
        return GetBool(function(_bool) {
            if (!lib.GetSignatureAllowed(id, wcb(signature), _bool))
                Fail(`Failed to check if signature ${signature} is allowed on ${id}`);
        });
    },
    GetAllowedSignatures: function(id) {
        return GetStringArray(function(_len) {
            if (!lib.GetAllowedSignatures(id, _len))
                Fail(`Failed to get allowed signatures for ${id}`);
        });
    },
    GetIsModified: function(id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsModified(id, _bool))
                Fail(`Failed to get is modified for ${id}`);
        });
    },
    GetIsEditable: function(id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsEditable(id, _bool))
                Fail(`Failed to get is editable for ${id}`);
        });
    },
    GetIsRemoveable: function(id) {
        return GetBool(function(_bool) {
            if (!lib.GetIsRemoveable(id, _bool))
                Fail(`Failed to get is removeable for ${id}`);
        });
    },
    GetCanAdd: function(id) {
        return GetBool(function(_bool) {
            if (!lib.GetCanAdd(id, _bool))
                Fail(`Failed to get can add for ${id}`);
        });
    },
    ElementType: function(id) {
        return GetEnumValue(id, 'ElementType');
    },
    DefType: function(id) {
        return GetEnumValue(id, 'DefType');
    },
    SmashType: function(id) {
        return GetEnumValue(id, 'SmashType');
    },
    ValueType: function(id) {
        return GetEnumValue(id, 'ValueType');
    },
    IsSorted: function(id) {
        return GetBool(function(_bool) {
            if (!lib.IsSorted(id, _bool))
                Fail(`Failed to get is sorted for ${id}`);
        });
    },
    IsFlags: function(id) {
        return xelib.ValueType(id) === xelib.vtFlags;
    }
});
