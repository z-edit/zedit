const remote = require('electron').remote;
const ref = require('ref');
const wchar_t = require('ref-wchar');
const ffi = require('ffi');

var Void = 'void';
var WString = wchar_t.string;
var Cardinal = ref.types.uint32;
var Integer = ref.types.int32;
var WordBool = ref.types.uint16;
var Double = ref.types.double;
var Byte = ref.types.byte;
var PWChar = ref.refType(WString);
var PCardinal = ref.refType(Cardinal);
var PInteger = ref.refType(Integer);
var PWordBool = ref.refType(WordBool);
var PDouble = ref.refType(Double);
var PByte = ref.refType(Byte);

// function binding
try {
    var lib = ffi.Library('XEditLib', {
        // META FUNCTIONS
        'InitXEdit': [Void, []],
        'CloseXEdit': [Void, []],
        'GetResultString': [WordBool, [PWChar, Integer]],
        'GetResultArray': [WordBool, [PCardinal, Integer]],
        'GetGlobal': [WordBool, [PWChar, PInteger]],
        'GetGlobals': [WordBool, [PInteger]],
        'Release': [WordBool, [Cardinal]],
        'Switch': [WordBool, [Cardinal, Cardinal]],
        'GetDuplicateHandles': [WordBool, [Cardinal, PInteger]],
        'ResetStore': [WordBool, []],
        // MESSAGE FUNCTIONS
        'GetMessagesLength': [Void, [PInteger]],
        'GetMessages': [WordBool, [PWChar, Integer]],
        'ClearMessages': [Void, []],
        'GetExceptionMessageLength': [Void, [PInteger]],
        'GetExceptionMessage': [WordBool, [PWChar, Integer]],
        // SETUP FUNCTIONS
        'SetGamePath': [WordBool, [PWChar]],
        'SetLanguage': [WordBool, [PWChar]],
        'SetGameMode': [WordBool, [Integer]],
        'GetGamePath': [WordBool, [Integer, PInteger]],
        'GetLoadOrder': [WordBool, [PInteger]],
        'GetActivePlugins': [WordBool, [PInteger]],
        'LoadPlugins': [WordBool, [PWChar]],
        'LoadPlugin': [WordBool, [PWChar]],
        'UnloadPlugin': [WordBool, [Cardinal]],
        'GetLoaderDone': [WordBool, []],
        // FILE HANDLING METHODS
        'AddFile': [WordBool, [PWChar, PCardinal]],
        'FileByIndex': [WordBool, [Integer, PCardinal]],
        'FileByLoadOrder': [WordBool, [Integer, PCardinal]],
        'FileByName': [WordBool, [PWChar, PCardinal]],
        'FileByAuthor': [WordBool, [PWChar, PCardinal]],
        'SaveFile': [WordBool, [Cardinal]],
        'OverrideRecordCount': [WordBool, [Cardinal, PInteger]],
        'MD5Hash': [WordBool, [Cardinal, PInteger]],
        'CRCHash': [WordBool, [Cardinal, PInteger]],
        'SortEditorIDs': [WordBool, [Cardinal, PWChar]],
        'SortNames': [WordBool, [Cardinal, PWChar]],
        // MASTER HANDLING METHODS
        'CleanMasters': [WordBool, [Cardinal]],
        'SortMasters': [WordBool, [Cardinal]],
        'AddMaster': [WordBool, [Cardinal, PWChar]],
        'AddMasters': [WordBool, [Cardinal, PWChar]],
        'GetMasters': [WordBool, [Cardinal, PInteger]],
        'GetRequiredBy': [WordBool, [Cardinal, PInteger]],
        // ELEMENT HANDLING METHODS
        'HasElement': [WordBool, [Cardinal, PWChar, PWordBool]],
        'GetElement': [WordBool, [Cardinal, PWChar, PCardinal]],
        'AddElement': [WordBool, [Cardinal, PWChar, PCardinal]],
        'RemoveElement': [WordBool, [Cardinal, PWChar]],
        'RemoveElementOrParent': [WordBool, [Cardinal]],
        'GetElements': [WordBool, [Cardinal, PWChar, Byte, PInteger]],
        'GetContainer': [WordBool, [Cardinal, PCardinal]],
        'GetElementFile': [WordBool, [Cardinal, PCardinal]],
        //'GetElementRecord': [WordBool, [Cardinal, PCardinal]], TODO: Uncomment when this is exported.
        'GetLinksTo': [WordBool, [Cardinal, PWChar, PCardinal]],
        'ElementCount': [WordBool, [Cardinal, PInteger]],
        'ElementEquals': [WordBool, [Cardinal, Cardinal, PWordBool]],
        'ElementMatches': [WordBool, [Cardinal, PWChar, PWChar, PWordBool]],
        'HasArrayItem': [WordBool, [Cardinal, PWChar, PWChar, PWChar, PWordBool]],
        'GetArrayItem': [WordBool, [Cardinal, PWChar, PWChar, PWChar, PCardinal]],
        'AddArrayItem': [WordBool, [Cardinal, PWChar, PWChar, PWChar, PCardinal]],
        'RemoveArrayItem': [WordBool, [Cardinal, PWChar, PWChar, PWChar]],
        'MoveArrayItem': [WordBool, [Cardinal, Integer]],
        'CopyElement': [WordBool, [Cardinal, Cardinal, WordBool, PCardinal]],
        'GetSignatureAllowed': [WordBool, [Cardinal, PWChar, PWordBool]],
        'SortKey': [WordBool, [Cardinal, PInteger]],
        'ElementType': [WordBool, [Cardinal, PByte]],
        'DefType': [WordBool, [Cardinal, PByte]],
        'SmashType': [WordBool, [Cardinal, PByte]],
        // ERROR CHECKING METHODS
        'CheckForErrors': [WordBool, [Cardinal]],
        'GetErrorThreadDone': [WordBool, []],
        'GetErrors': [WordBool, [PInteger]],
        // ELEMENT VALUE METHODS
        'Name': [WordBool, [Cardinal, PInteger]],
        'LongName': [WordBool, [Cardinal, PInteger]],
        'DisplayName': [WordBool, [Cardinal, PInteger]],
        'Path': [WordBool, [Cardinal, WordBool, PInteger]],
        'Signature': [WordBool, [Cardinal, PInteger]],
        'GetValue': [WordBool, [Cardinal, PWChar, PInteger]],
        'SetValue': [WordBool, [Cardinal, PWChar, PWChar]],
        'GetIntValue': [WordBool, [Cardinal, PWChar, PInteger]],
        'SetIntValue': [WordBool, [Cardinal, PWChar, Integer]],
        'GetUIntValue': [WordBool, [Cardinal, PWChar, PCardinal]],
        'SetUIntValue': [WordBool, [Cardinal, PWChar, Cardinal]],
        'GetFloatValue': [WordBool, [Cardinal, PWChar, PDouble]],
        'SetFloatValue': [WordBool, [Cardinal, PWChar, Double]],
        'GetFlag': [WordBool, [Cardinal, PWChar, PWChar, PWordBool]],
        'SetFlag': [WordBool, [Cardinal, PWChar, PWChar, WordBool]],
        'GetEnabledFlags': [WordBool, [Cardinal, PWChar, PInteger]],
        'SetEnabledFlags': [WordBool, [Cardinal, PWChar]],
        'GetAllFlags': [WordBool, [Cardinal, PWChar, PInteger]],
        'SignatureFromName': [WordBool, [PWChar, PInteger]],
        'NameFromSignature': [WordBool, [PWChar, PInteger]],
        'GetSignatureNameMap': [WordBool, [PInteger]],
        // SERIALIZATION METHODS
        'ElementToJson': [WordBool, [Cardinal, PInteger]],
        'ElementFromJson': [WordBool, [Cardinal, PWChar, PWChar]],
        // RECORD HANDLING METHODS
        'GetFormID': [WordBool, [Cardinal, PCardinal, WordBool]],
        'SetFormID': [WordBool, [Cardinal, Cardinal, WordBool, WordBool]],
        'GetRecords': [WordBool, [Cardinal, PWChar, WordBool, PInteger]],
        'GetOverrides': [WordBool, [Cardinal, PInteger]],
        'GetReferencedBy': [WordBool, [Cardinal, PInteger]],
        'ExchangeReferences': [WordBool, [Cardinal, Cardinal, Cardinal]],
        'IsMaster': [WordBool, [Cardinal, PWordBool]],
        'IsInjected': [WordBool, [Cardinal, PWordBool]],
        'IsOverride': [WordBool, [Cardinal, PWordBool]],
        'IsWinningOverride': [WordBool, [Cardinal, PWordBool]],
        'ConflictThis': [WordBool, [Cardinal, PByte]],
        'ConflictAll': [WordBool, [Cardinal, PByte]]
    });
} catch (x) {
    alert('The required file XEditLib.dll was not found.  Please try re-installing the application.');
    remote.getCurrentWindow().close();
}

// ENUMERATIONS
var elementTypes = ['etFile', 'etMainRecord', 'etGroupRecord', 'etSubRecord', 'etSubRecordStruct', 'etSubRecordArray',
    'etSubRecordUnion', 'etArray', 'etStruct', 'etValue', 'etFlag', 'etStringListTerminator', 'etUnion',
    'etStructChapter'];
var defTypes = [ 'dtRecord', 'dtSubRecord', 'dtSubRecordArray', 'dtSubRecordStruct', 'dtSubRecordUnion', 'dtString',
    'dtLString', 'dtLenString', 'dtByteArray', 'dtInteger', 'dtIntegerFormater', 'dtIntegerFormaterUnion', 'dtFlag',
    'dtFloat', 'dtArray', 'dtStruct', 'dtUnion', 'dtEmpty', 'dtStructChapter'];
var smashTypes = ['stUnknown', 'stRecord', 'stString', 'stInteger', 'stFlag', 'stFloat', 'stStruct', 'stUnsortedArray',
    'stUnsortedStructArray', 'stSortedArray', 'stSortedStructArray', 'stByteArray', 'stUnion'];
var conflictThis = [ 'ctUnknown', 'ctIgnored', 'ctNotDefined', 'ctIdenticalToMaster', 'ctOnlyOne', 'ctHiddenByModGroup',
    'ctMaster', 'ctConflictBenign', 'ctOverride', 'ctIdenticalToMasterWinsConflict', 'ctConflictWins',
    'ctConflictLoses'];
var conflictAll = [ 'caUnknown', 'caOnlyOne', 'caNoConflict', 'caConflictBenign', 'caOverride', 'caConflict',
    'caConflictCritical'];
var sortBy = {
  'None': 0,
  'FormID': 1,
  'EditorID': 2,
  'Name': 3
};

// helper functions
var createTypedBuffer = function(size, type) {
    var buf = new Buffer(size);
    buf.type = type;
    return buf;
};

var readPWCharString = function(buf) {
    return wchar_t.toString(buf);
};

var readCardinalArray = function(buf, len) {
    var a = [];
    for (var i = 0; i < 4 * len; i+=4)
      a.push(buf.readUInt32LE(i));
    return a;
};

var wcb = function(value) {
    var buf = new Buffer((value.length + 1) * 2);
    buf.write(value, 0, 'ucs2');
    buf.type = PWChar;
    return buf;
};

var elementContext = function(_id, path) {
    return `${_id}, "${path}"`;
};

var flagContext = function(_id, path, name) {
    return `${_id}, "${path}\\${name}"`;
};

var Fail = function(message) {
    try {
        var libMessage = xelib.GetExceptionMessage();
        if (libMessage) console.log(libMessage);
    } catch (e) {
        console.log('Unknown critical exception!');
    }
    throw message;
};

var GetString = function(callback, method = 'GetResultString') {
    var _len = createTypedBuffer(4, PInteger);
    callback(_len);
    var len = _len.readInt32LE(0);
    if (len == 0) return '';
    var str = createTypedBuffer(2 * len, PWChar);
    if (!lib[method](str, len))
        Fail(`${method} failed.`);
    return readPWCharString(str);
};

var GetHandle = function(callback) {
    var _res = createTypedBuffer(4, PCardinal);
    callback(_res);
    return _res.readUInt32LE(0);
};

var GetInteger = function(callback) {
    var _res = createTypedBuffer(4, PInteger);
    callback(_res);
    return _res.readInt32LE(0);
};

var GetBool = function(callback) {
    var _bool = createTypedBuffer(2, PWordBool);
    callback(_bool);
    return _bool.readUInt16LE(0) > 0;
};

var GetArray = function(callback) {
    var _len = createTypedBuffer(4, PInteger);
    callback(_len);
    var len = _len.readInt32LE(0);
    if (len == 0) return [];
    var a = createTypedBuffer(4 * len, PCardinal);
    if (!lib.GetResultArray(a, len))
        Fail('GetResultArray failed');
    return readCardinalArray(a, len);
};

var GetDictionary = function(_len) {
    var str = GetString(_len);
    var pairs = str.split('\n').slice(0, -1);
    var dictionary = {};
    pairs.forEach(function(pair) {
        var n = pair.indexOf('=');
        dictionary[pair.substr(0, n)] = pair.substr(n + 1, pair.length);
    });
    return dictionary;
};

var GetBoolValue = function(_id, method) {
    return GetBool(function(_bool) {
        if (!lib[method](_id, _bool))
            Fail(`Failed to call ${method} on ${_id}`);
    });
};

var GetStringValue = function(_id, method) {
    return GetString(function(_len) {
        if (!lib[method](_id, _len))
            Fail(`${method} failed on ${_id}`);
    });
};

var GetEnumValue = function(_id, method, enums) {
    var _res = createTypedBuffer(4, PByte);
    if (!lib[method](_id, _res))
        Fail(`${method} failed on ${_id}`);
    let n = _res.readUInt8(0);
    return enums && enums[n] || n;
};

var GetNativeValue = function(_id, path, method, refType) {
    var buff = createTypedBuffer(refType == PDouble ? 8 : 4, refType);
    if (!lib[method](_id, wcb(path), buff))
        Fail(`Failed to ${method} at: ${elementContext(_id, path)}`);
    return buff;
};

var SetNativeValue = function(_id, path, method, value) {
    if (value === undefined) {
        value = path;
        path = '';
    }
    if (!lib[method](_id, wcb(path), value))
        Fail(`Failed to ${method} to ${value} at: ${elementContext(_id, path)}`);
};

// wrapper functions
var xelib = {
    // META FUNCTIONS
    'Initialize': function() {
        lib.InitXEdit();
    },
    'Finalize': function() {
        lib.CloseXEdit();
    },
    'GetGlobal': function(key) {
        return GetString(function(_len) {
            if (!lib.GetGlobal(wcb(key), _len))
                Fail('GetGlobal failed.');
        });
    },
    'GetGlobals': function() {
        return GetString(function(_len) {
            if (!lib.GetGlobals(_len))
                Fail('GetGlobals failed.');
        });
    },
    'Release': function(_id) {
        if (!lib.Release(_id))
            Fail(`Failed to release interface #${_id}`);
    },
    'Switch': function(_id, _id2) {
        if (!lib.Switch(_id, _id2))
            Fail(`Failed to switch interface #${_id} and #${_id2}`);
    },
    'GetDuplicateHandles': function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetDuplicateHandles(_id, _len))
                Fail(`Failed to get duplicate handles for: ${_id}`);
        });
    },
    'ResetStore': function() {
        if (!lib.ResetStore())
            Fail('Failed to reset interface store');
    },

    // MESSAGE FUNCTIONS
    'GetMessages': function() {
        return GetString(function(_len) {
            lib.GetMessagesLength(_len);
        }, 'GetMessages');
    },
    'ClearMessages': function() {
        lib.ClearMessages();
    },
    'GetExceptionMessage': function() {
        var len = createTypedBuffer(4, PInteger);
        if (!lib.GetExceptionMessageLength(len) || len == 0)
            return '';
        var str = createTypedBuffer(2 * len, PWChar);
        lib.GetExceptionMessage(str, len);
        return readPWCharString(str);
    },

    // SETUP FUNCTIONS
    'SetGamePath': function(gamePath) {
        if (!lib.SetGamePath(wcb(gamePath)))
            Fail(`Failed to set game path to ${gamePath}`);
    },
    'SetLanguage': function(language) {
        if (!lib.SetLanguage(wcb(language)))
            Fail(`Failed to set language to ${language}`);
    },
    'SetGameMode': function(gameMode) {
        if (!lib.SetGameMode(gameMode))
            Fail(`Failed to set game mode to ${gameMode}`);
    },
    'GetLoadOrder': function() {
        return GetString(function(_len) {
            if (!lib.GetLoadOrder(_len))
                Fail('Failed to get load order');
        });
    },
    'GetActivePlugins': function() {
        return GetString(function(_len) {
            if (!lib.GetActivePlugins(_len))
                Fail('Failed to get active plugins');
        });
    },
    'LoadPlugins': function(loadOrder) {
        if (!lib.LoadPlugins(wcb(loadOrder)))
            Fail('Failed to load plugins.');
    },
    'GetLoaderDone': function() {
        return lib.GetLoaderDone();
    },
    'GetGamePath': function(gameMode) {
        var len = createTypedBuffer(4, PInteger);
        if (!lib.GetGamePath(gameMode, len) || len == 0)
            return '';
        var str = createTypedBuffer(2 * len, PWChar);
        lib.GetResultString(str, len);
        return readPWCharString(str);
    },

    // FILE HANDLING METHODS
    'AddFile': function(filename) {
        return GetHandle(function(_res) {
            if (!lib.AddFile(wcb(filename), _res))
                Fail(`Failed to add new file: ${filename}`);
        });
    },
    'FileByIndex': function(index) {
        return GetHandle(function(_res) {
            if (!lib.FileByIndex(index, _res))
                Fail(`Failed to find file at index: ${index}`);
        });
    },
    'FileByLoadOrder': function(loadOrder) {
        return GetHandle(function(_res) {
            if (!lib.FileByLoadOrder(loadOrder, _res))
                Fail(`Failed to find file at load order: ${loadOrder}`);
        });
    },
    'FileByName': function(filename) {
        return GetHandle(function(_res) {
            if (!lib.FileByName(wcb(filename), _res))
                Fail(`Failed to find file: ${filename}`);
        });
    },
    'FileByAuthor': function(author) {
        return GetHandle(function(_res) {
            if (!lib.FileByAuthor(wcb(author), _res))
                Fail(`Failed to find file with author: ${author}`);
        });
    },
    'MD5Hash': function(_id) {
        return GetString(function(_len) {
            if (!lib.MD5Hash(_id, _len))
                Fail(`Failed to get MD5 Hash for: ${_id}`);
        });
    },
    'CRCHash': function(_id) {
        return GetString(function(_len) {
            if (!lib.CRCHash(_id, _len))
                Fail(`Failed to get CRC Hash for: ${_id}`);
        });
    },
    'SaveFile': function(_id) {
        if (!lib.SaveFile(_id))
            Fail(`Failed to save file: ${_id}`);
    },

    // MASTER HANDLING METHODS
    'CleanMasters': function(_id) {
        if (!lib.CleanMasters(_id))
            Fail(`Failed to clean masters in: ${_id}`);
    },
    'SortMasters': function(_id) {
        if (!lib.SortMasters(_id))
            Fail(`Failed to sort masters in: ${_id}`);
    },
    'AddMaster': function(_id, filename) {
        if (!lib.AddMaster(_id, wcb(filename)))
            Fail(`Failed to add master "${filename}" to file: ${_id}`);
    },
    'GetMasters': function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetMasters(_id, _len))
                Fail(`Failed to get masters for ${_id}`);
        });
    },

    // ELEMENT HANDLING METHODS
    'HasElement': function(_id, path = '') {
        return GetBool(function(_bool) {
            if (!lib.HasElement(_id, wcb(path), _bool))
                Fail(`Failed to check if element exists at: ${elementContext(_id, path)}`);
        });
    },
    'GetElement': function(_id, path = '', noException = false) {
        return GetHandle(function(_res) {
            if (!lib.GetElement(_id, wcb(path), _res))
                if (!noException) Fail(`Failed to get element at: ${elementContext(_id, path)}`);
        });
    },
    'AddElement': function(_id, path = '') {
        return GetHandle(function(_res) {
            if (!lib.AddElement(_id, wcb(path), _res))
                Fail(`Failed to create new element at: ${elementContext(_id, path)}`);
        });
    },
    'RemoveElement': function(_id, path = '') {
        if (!lib.RemoveElement(_id, wcb(path)))
            Fail(`Failed to remove element at: ${elementContext(_id, path)}`);
    },
    'RemoveElementOrParent': function(_id) {
        if (!lib.RemoveElementOrParent(_id))
            Fail(`Failed to remove element ${_id}`);
    },
    'GetElements': function(_id, path = '', sort = 'None') {
        return GetArray(function(_len) {
            if (!lib.GetElements(_id, wcb(path), sortBy[sort] || 0, _len))
                Fail(`Failed to get child elements at: ${elementContext(_id, path)}`);
        });
    },
    'GetLinksTo': function(_id, path) {
        return GetHandle(function(_res) {
            if (!lib.GetLinksTo(_id, wcb(path), _res))
                Fail(`Failed to get link at: ${elementContext(_id, path)}`);
        });
    },
    'GetContainer': function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetContainer(_id, _res))
                Fail(`Failed to get container for: ${_id}`);
        });
    },
    'GetElementFile': function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetElementFile(_id, _res))
                Fail(`Failed to get element file for: ${_id}`);
        });
    },
    'ElementCount': function(_id) {
        return GetInteger(function(_res) {
            if (!lib.ElementCount(_id, _res))
                Fail(`Failed to get element count for ${_id}`);
        });
    },
    'ElementEquals': function(_id, _id2) {
        return GetBool(function(_bool) {
            if (!lib.ElementEquals(_id, _id2, _bool))
                Fail(`Failed to check element equality for ${_id} and ${_id2}`);
        });
    },
    'CopyElement': function(_id, _id2, asNew = false, deepCopy = true) {
        return GetHandle(function(_res) {
            if (!lib.CopyElement(_id, _id2, asNew, deepCopy, _res))
                Fail(`Failed to copy element from ${_id} to ${_id2}`);
        });
    },
    'GetSignatureAllowed': function(_id, signature) {
        return GetBool(function(_bool) {
            if (!lib.GetSignatureAllowed(_id, wcb(signature), _bool))
                Fail(`Failed to check if signature ${signature} is allowed on ${_id}`);
        });
    },

    // ERROR CHECKING METHODS
    'CheckForErrors': function(_id) {
        if (!lib.CheckForErrors(_id))
            Fail(`Failed to check ${_id} for errors.`);
    },
    'GetErrorThreadDone': function() {
        return lib.GetErrorThreadDone();
    },
    'GetErrors': function() {
        let str = GetString(function(_len) {
            if (!lib.GetErrors(_len))
                Fail('Failed to get errors');
        });
        return JSON.parse(str).errors;
    },

    // SERIALIZATION METHODS
    'ElementToJSON': function(_id) {
        return GetString(function(_len) {
            if (!lib.ElementToJson(_id, _len))
                Fail(`Failed to serialize element to JSON: ${_id}`);
        });
    },
    'ElementToObject': function(_id) {
        return JSON.parse(this.ElementToJSON(_id));
    },

    // ELEMENT VALUE METHODS
    'Name': function(_id) {
        return GetStringValue(_id, 'Name');
    },
    'LongName': function(_id) {
        return GetStringValue(_id, 'LongName');
    },
    'DisplayName': function(_id) {
        return GetStringValue(_id, 'DisplayName');
    },
    'Path': function(_id) {
        return GetString(function(_len) {
            if (!lib.Path(_id, false, _len))
                Fail(`Path failed on ${_id}`);
        });
    },
    'FullPath': function(_id) {
        return GetString(function(_len) {
            if (!lib.Path(_id, true, _len))
                Fail(`Path failed on ${_id}`);
        });
    },
    'Signature': function(_id) {
        return GetStringValue(_id, 'Signature');
    },
    'SortKey': function(_id) {
        return GetStringValue(_id, 'SortKey');
    },
    'ElementType': function(_id, asString = false) {
        return GetEnumValue(_id, 'ElementType', asString && elementTypes);
    },
    'DefType': function(_id, asString = false) {
        return GetEnumValue(_id, 'DefType', asString && defTypes);
    },
    'SmashType': function(_id, asString = false) {
        return GetEnumValue(_id, 'SmashType', asString && smashTypes);
    },
    'GetValue': function(_id, path = '', noException = false) {
        return GetString(function(_len) {
            if (!lib.GetValue(_id, wcb(path), _len))
                if (!noException) Fail(`Failed to get element value at: ${elementContext(_id, path)}`);
        });
    },
    'SetValue': function(_id, path, value) {
        if (value === undefined) {
            value = path;
            path = '';
        }
        if (!lib.SetValue(_id, wcb(path), wcb(value)))
            Fail(`Failed to set element value at: ${elementContext(_id, path)}`);
    },
    'GetIntValue': function(_id, path) {
        return GetNativeValue(_id, path, 'GetIntValue', PInteger).readInt32LE();
    },
    'SetIntValue': function(_id, path, value) {
        SetNativeValue(_id, path, 'SetIntValue', value);
    },
    'GetUIntValue': function(_id, path) {
        return GetNativeValue(_id, path, 'GetUIntValue', PCardinal).readUInt32LE();
    },
    'SetUIntValue': function(_id, path, value) {
        SetNativeValue(_id, path, 'SetUIntValue', value);
    },
    'GetFloatValue': function(_id, path) {
        return GetNativeValue(_id, path, 'GetFloatValue', PDouble).readDoubleLE();
    },
    'SetFloatValue': function(_id, path, value) {
        SetNativeValue(_id, path, 'SetFloatValue', value);
    },
    'SetFlag': function(_id, path, name, enabled) {
        if (!lib.SetFlag(_id, wcb(path), wcb(name), enabled))
            Fail(`Failed to set flag value at: ${flagContext(_id, path, name)} to ${enabled}`);
    },
    'GetFlag': function(_id, path, name) {
        return GetBool(function(_bool) {
            if (!lib.GetFlag(_id, wcb(path), wcb(name), _bool))
                Fail(`Failed to get flag value at: ${flagContext(_id, path, name)}`);
        });
    },
    'GetEnabledFlags': function(_id, path) {
        return GetString(function(_len) {
            if (!lib.GetEnabledFlags(_id, wcb(path), _len))
                Fail(`Failed to get enabled flags at: ${elementContext(_id, path)}`);
        }).split(',');
    },
    'SetEnabledFlags': function(_id, path, flags) {
        if (!lib.SetEnabledFlags(_id, wcb(path), wcb(flags.join(','))))
            Fail(`Failed to set enabled flags at: ${elementContext(_id, path)}`);
    },
    'GetAllFlags': function(_id, path) {
        return GetString(function(_len) {
            if (!lib.GetAllFlags(_id, wcb(path), _len))
                Fail(`Failed to get all flags at: ${elementContext(_id, path)}`);
        }).split(',');
    },

    // RECORD HANDLING METHODS
    'GetFormID': function(_id, local = false) {
        var _res = createTypedBuffer(4, PCardinal);
        if (!lib.GetFormID(_id, _res, local))
            Fail(`Failed to get FormID for ${_id}`);
        return _res.readUInt32LE();
    },
    'SetFormID': function(_id, newFormID, local = false, fixReferences = true) {
        if (!lib.SetFormID(_id, newFormID, local, fixReferences))
            Fail(`Failed to set FormID on ${_id} to ${newFormID}`);
    },
    'GetRecords': function(_id, search, includeOverrides = false) {
        return GetArray(function(_len) {
            if (!lib.GetRecords(_id, wcb(search), includeOverrides, _len))
                Fail(`Failed to get records from: ${elementContext(_id, search)}`);
        });
    },
    'GetOverrides': function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetOverrides(_id, _len))
                Fail(`Failed to get overrides for: ${_id}`);
        });
    },
    'ExchangeReferences': function(_id, oldFormID, newFormID) {
        if (!lib.ExchangeReferences(_id, oldFormID, newFormID))
            Fail(`Failed to exchange references on ${_id} from ${oldFormID} to ${newFormID}`)
    },
    'GetReferencedBy': function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetReferencedBy(_id, _len))
                Fail(`Failed to get referenced by for: ${_id}`);
        });
    },
    'IsMaster': function(_id) {
        return GetBoolValue(_id, "IsMaster");
    },
    'IsInjected': function(_id) {
        return GetBoolValue(_id, "IsInjected");
    },
    'IsOverride': function(_id) {
        return GetBoolValue(_id, "IsOverride");
    },
    'IsWinningOverride': function(_id) {
        return GetBoolValue(_id, "IsWinningOverride");
    },
    'ConflictThis': function(_id, asString = false) {
        return GetEnumValue(_id, 'ConflictThis', asString && conflictThis);
    },
    'ConflictAll': function(_id, asString = false) {
        return GetEnumValue(_id, 'ConflictAll', asString && conflictAll);
    },

    /*** WRAPPER METHODS ***/

    // GROUP HANDLING METHODS
    'HasGroup': function(_id, signature) {
        return this.HasElement(_id, signature);
    },
    'AddGroup': function(_id, signature) {
        return this.AddElement(_id, signature);
    },
    'GetChildGroup': function(_id) {
        return this.GetElement(_id, 'Child Group');
    },

    // FILE VALUE METHODS
    'GetFileHeader': function(_id) {
        return this.GetElement(_id, 'File Header');
    },
    'GetNextObjectID': function(_id) {
        return this.GetUIntValue(_id, 'File Header\\HEDR\\Next Object ID');
    },
    'SetNextObjectID': function(_id, nextObjectID) {
        this.SetUIntValue(_id, 'File Header\\HEDR\\Next Object ID', nextObjectID);
    },
    'GetFileName': function(_id) {
        return this.Name(_id);
    },
    'GetAuthor': function(_id) {
        return this.GetValue(_id, 'File Header\\CNAM');
    },
    'SetAuthor': function(_id, author) {
        return this.SetValue(_id, 'File Header\\CNAM', wcb(author));
    },
    'GetDescription': function(_id) {
        return this.GetValue(_id, 'File Header\\SNAM');
    },
    'SetDescription': function(_id, description) {
        return this.SetValue(_id, 'File Header\\SNAM', wcb(description));
    },
    'GetIsESM': function(_id) {
        return this.GetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM');
    },
    'SetIsESM': function(_id, enabled) {
        return this.SetFlag(_id, 'File Header\\Record Header\\Record Flags', 'ESM', enabled);
    },

    // RECORD VALUE METHODS
    'EditorID': function(_id, noException = false) {
        return this.GetValue(_id, 'EDID', noException);
    },
    'FullName': function(_id, noException = false) {
        return this.GetValue(_id, 'FULL', noException);
    },
    'Translate': function(_id, vector) {
        var xelib = this;
        var position = xelib.GetElement(_id, 'DATA\\Position');
        ['X', 'Y', 'Z'].forEach(function(coord) {
            if (vector.hasOwnProperty(coord)) {
                var newValue = xelib.GetFloatValue(position, coord) + vector[coord];
                xelib.SetFloatValue(position, coord, newValue);
            }
        });
    },
    'Rotate': function(_id, vector) {
        var xelib = this;
        var rotation = xelib.GetElement(_id, 'DATA\\Rotation');
        ['X', 'Y', 'Z'].forEach(function(coord) {
            if (vector.hasOwnProperty(coord)) {
                var newValue = xelib.GetFloatValue(rotation, coord) + vector[coord];
                xelib.SetFloatValue(rotation, coord, newValue);
            }
        });
    },
    'GetRecordFlag': function(_id, name) {
        return this.GetFlag(_id, 'Record Header\\Record Flags', name);
    },
    'SetRecordFlag': function(_id, name, enabled) {
        this.SetFlag(_id, 'Record Header\\Record Flags', name, enabled);
    },

    // UTILITY METHODS
    'IntToHex': function(n, padding = 8) {
        let str = Number(n).toString(16).toUpperCase();
        while (str.length < padding) str = '0' + str;
        return str;
    }
};

var applyEnums = function(context, enums) {
    enums.forEach((value, ord) => context[value] = ord);
};

applyEnums(xelib, elementTypes);
applyEnums(xelib, defTypes);
applyEnums(xelib, smashTypes);
applyEnums(xelib, conflictThis);
applyEnums(xelib, conflictAll);

export default xelib;
