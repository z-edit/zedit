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
        // META METHODS
        'InitXEdit': [Void, []],
        'CloseXEdit': [Void, []],
        'GetResultString': [WordBool, [PWChar, Integer]],
        'GetResultArray': [WordBool, [PCardinal, Integer]],
        'GetGlobal': [WordBool, [PWChar, PInteger]],
        'GetGlobals': [WordBool, [PInteger]],
        'SetSortMode': [WordBool, [Byte, WordBool]],
        'Release': [WordBool, [Cardinal]],
        'ReleaseNodes': [WordBool, [Cardinal]],
        'Switch': [WordBool, [Cardinal, Cardinal]],
        'GetDuplicateHandles': [WordBool, [Cardinal, PInteger]],
        'ResetStore': [WordBool, []],
        // MESSAGE METHODS
        'GetMessagesLength': [Void, [PInteger]],
        'GetMessages': [WordBool, [PWChar, Integer]],
        'ClearMessages': [Void, []],
        'GetExceptionMessageLength': [Void, [PInteger]],
        'GetExceptionMessage': [WordBool, [PWChar, Integer]],
        // LOADING AND SET UP METHODS
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
        'GetElements': [WordBool, [Cardinal, PWChar, WordBool, PInteger]],
        'GetDefNames': [WordBool, [Cardinal, PInteger]],
        'GetAddList': [WordBool, [Cardinal, PInteger]],
        'GetContainer': [WordBool, [Cardinal, PCardinal]],
        'GetElementFile': [WordBool, [Cardinal, PCardinal]],
        'GetElementRecord': [WordBool, [Cardinal, PCardinal]],
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
        'GetIsModified': [WordBool, [Cardinal, PWordBool]],
        'GetIsEditable': [WordBool, [Cardinal, PWordBool]],
        'GetIsRemoveable': [WordBool, [Cardinal, PWordBool]],
        'GetCanAdd': [WordBool, [Cardinal, PWordBool]],
        'SortKey': [WordBool, [Cardinal, PInteger]],
        'ElementType': [WordBool, [Cardinal, PByte]],
        'DefType': [WordBool, [Cardinal, PByte]],
        'SmashType': [WordBool, [Cardinal, PByte]],
        'ValueType': [WordBool, [Cardinal, PByte]],
        // ERROR CHECKING METHODS
        'CheckForErrors': [WordBool, [Cardinal]],
        'GetErrorThreadDone': [WordBool, []],
        'GetErrors': [WordBool, [PInteger]],
        // ELEMENT VALUE METHODS
        'Name': [WordBool, [Cardinal, PInteger]],
        'LongName': [WordBool, [Cardinal, PInteger]],
        'DisplayName': [WordBool, [Cardinal, PInteger]],
        'Path': [WordBool, [Cardinal, WordBool, WordBool, PInteger]],
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
        'SetEnabledFlags': [WordBool, [Cardinal, PWChar, PWChar]],
        'GetAllFlags': [WordBool, [Cardinal, PWChar, PInteger]],
        'GetEnumOptions': [WordBool, [Cardinal, PWChar, PInteger]],
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
        'GetMaster': [WordBool, [Cardinal, PCardinal]],
        'FindNextRecord': [WordBool, [Cardinal, PWChar, WordBool, WordBool, PCardinal]],
        'FindPreviousRecord': [WordBool, [Cardinal, PWChar, WordBool, WordBool, PCardinal]],
        'GetReferencedBy': [WordBool, [Cardinal, PInteger]],
        'ExchangeReferences': [WordBool, [Cardinal, Cardinal, Cardinal]],
        'IsMaster': [WordBool, [Cardinal, PWordBool]],
        'IsInjected': [WordBool, [Cardinal, PWordBool]],
        'IsOverride': [WordBool, [Cardinal, PWordBool]],
        'IsWinningOverride': [WordBool, [Cardinal, PWordBool]],
        'GetNodes': [WordBool, [Cardinal, PCardinal]],
        'GetConflictData': [WordBool, [Cardinal, Cardinal, PByte, PByte]],
        'GetNodeElements': [WordBool, [Cardinal, Cardinal, PInteger]]
    });
} catch (x) {
    alert('The required file XEditLib.dll was not found.  Please try re-installing the application.');
    remote.getCurrentWindow().close();
}