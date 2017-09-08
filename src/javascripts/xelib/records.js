import {lib, xelib} from './lib';
import {applyEnums, createTypedBuffer, elementContext, Fail, GetArray, GetBoolValue, GetStringArray, GetHandle, wcb} from './helpers';
import {Void, WString,  Cardinal,  Integer,  WordBool,  Double,  Byte,
               PWChar, PCardinal, PInteger, PWordBool, PDouble, PByte} from './types';

// ENUMERATIONS
const conflictThis = [ 'ctUnknown', 'ctIgnored', 'ctNotDefined', 'ctIdenticalToMaster', 'ctOnlyOne', 'ctHiddenByModGroup', 'ctMaster', 'ctConflictBenign', 'ctOverride', 'ctIdenticalToMasterWinsConflict','ctConflictWins', 'ctConflictLoses'];
const conflictAll = [ 'caUnknown', 'caOnlyOne', 'caNoConflict', 'caConflictBenign', 'caOverride', 'caConflict', 'caConflictCritical'];

applyEnums(xelib, conflictThis, 'conflictThis');
applyEnums(xelib, conflictAll, 'conflictAll');

// RECORD HANDLING METHODS
xelib.GetFormID = function(_id, local = false) {
    let _res = createTypedBuffer(4, PCardinal);
    if (!lib.GetFormID(_id, _res, local))
        Fail(`Failed to get FormID for ${_id}`);
    return _res.readUInt32LE();
};
xelib.SetFormID = function(_id, newFormID, local = false, fixReferences = true) {
    if (!lib.SetFormID(_id, newFormID, local, fixReferences))
        Fail(`Failed to set FormID on ${_id} to ${newFormID}`);
};
xelib.GetRecords = function(_id, search, includeOverrides = false) {
    return GetArray(function(_len) {
        if (!lib.GetRecords(_id, wcb(search), includeOverrides, _len))
            Fail(`Failed to get records from: ${elementContext(_id, search)}`);
    });
};
xelib.GetOverrides = function(_id) {
    return GetArray(function(_len) {
        if (!lib.GetOverrides(_id, _len))
            Fail(`Failed to get overrides for: ${_id}`);
    });
};
xelib.GetMaster = function(_id) {
    return GetHandle(function(_res) {
        if (!lib.GetMaster(_id, _res))
            Fail(`Failed to get master for: ${_id}`);
    });
};
xelib.FindNextRecord = function(_id, search, byEdid, byName, noException = false) {
    return GetHandle(function(_res) {
        if (!lib.FindNextRecord(_id, wcb(search), byEdid, byName, _res))
            if (!noException) Fail(`Failed to find next record for: ${search}`);
    });
};
xelib.FindPreviousRecord = function(_id, search, byEdid, byName, noException = false) {
    return GetHandle(function(_res) {
        if (!lib.FindPreviousRecord(_id, wcb(search), byEdid, byName, _res))
            if (!noException) Fail(`Failed to find previous record for: ${search}`);
    });
};
xelib.FindValidReferences = function(_id, search, limitTo) {
    return GetStringArray(function(_len) {
        if (!lib.FindValidReferences(_id, wcb(search), limitTo, _len))
            Fail(`Failed to find valid references on ${_id} searching for: ${search}`);
    });
};
xelib.GetReferencedBy = function(_id) {
    return GetArray(function(_len) {
        if (!lib.GetReferencedBy(_id, _len))
            Fail(`Failed to get referenced by for: ${_id}`);
    });
};
xelib.ExchangeReferences = function(_id, oldFormID, newFormID) {
    if (!lib.ExchangeReferences(_id, oldFormID, newFormID))
        Fail(`Failed to exchange references on ${_id} from ${oldFormID} to ${newFormID}`)
};
xelib.IsMaster = function(_id) {
    return GetBoolValue(_id, "IsMaster");
};
xelib.IsInjected = function(_id) {
    return GetBoolValue(_id, "IsInjected");
};
xelib.IsOverride = function(_id) {
    return GetBoolValue(_id, "IsOverride");
};
xelib.IsWinningOverride = function(_id) {
    return GetBoolValue(_id, "IsWinningOverride");
};
xelib.GetNodes = function(_id) {
    return GetHandle(function(_res) {
        if (!lib.GetNodes(_id, _res))
            Fail(`Failed to get nodes for ${_id}`);
    });
};
xelib.GetConflictData = function(_id1, _id2, asString = false, noException = false) {
    let _res1 = createTypedBuffer(1, PByte),
        _res2 = createTypedBuffer(1, PByte);
    if (!lib.GetConflictData(_id1, _id2, _res1, _res2)) {
        if (noException) return [0, 0];
        Fail(`GetConflictData failed on ${_id1}, ${_id2}`);
    }
    let n1 = _res1.readUInt8(0),
        n2 = _res2.readUInt8(0);
    return asString ? [conflictAll[n1], conflictThis[n2]] : [n1, n2];
};
xelib.GetRecordConflictData = function(_id) {
    let nodes = xelib.GetNodes(_id);
    try {
        return xelib.GetConflictData(nodes, _id);
    } finally {
        xelib.ReleaseNodes(nodes);
    }
};
xelib.GetNodeElements = function(_id1, _id2) {
    return GetArray(function(_len) {
        if (!lib.GetNodeElements(_id1, _id2, _len))
            Fail(`GetNodeElements failed on ${_id1}, ${_id2}`);
    });
};
