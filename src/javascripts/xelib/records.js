import { lib, xelib } from './lib';
import { applyEnums, createTypedBuffer, elementContext, Fail, GetArray,
         GetBoolValue, GetStringArray, GetHandle, wcb } from './helpers';
import { PCardinal, PByte } from './types';

// ENUMERATIONS
const conflictThis = ['ctUnknown', 'ctIgnored', 'ctNotDefined', 'ctIdenticalToMaster', 'ctOnlyOne', 'ctHiddenByModGroup', 'ctMaster', 'ctConflictBenign', 'ctOverride', 'ctIdenticalToMasterWinsConflict', 'ctConflictWins', 'ctConflictLoses'];
const conflictAll = ['caUnknown', 'caOnlyOne', 'caNoConflict', 'caConflictBenign', 'caOverride', 'caConflict', 'caConflictCritical'];

applyEnums(xelib, conflictThis, 'conflictThis');
applyEnums(xelib, conflictAll, 'conflictAll');

// RECORD HANDLING METHODS
Object.assign(xelib, {
    GetFormID: function(_id, local = false) {
        let _res = createTypedBuffer(4, PCardinal);
        if (!lib.GetFormID(_id, _res, local))
            Fail(`Failed to get FormID for ${_id}`);
        return _res.readUInt32LE();
    },
    GetHexFormID: function(_id, local = false) {
        return xelib.Hex(xelib.GetFormID(_id, local));
    },
    SetFormID: function(_id, newFormID, local = false, fixReferences = true) {
        if (!lib.SetFormID(_id, newFormID, local, fixReferences))
            Fail(`Failed to set FormID on ${_id} to ${newFormID}`);
    },
    GetRecord: function(_id, formID) {
        return GetHandle(function(_res) {
            if (!lib.GetRecord(_id, formID, _res))
                Fail(`Failed to get record at: ${_id}, ${formID}`);
        });
    },
    GetRecords: function(_id, search, includeOverrides = false) {
        return GetArray(function(_len) {
            if (!lib.GetRecords(_id, wcb(search), includeOverrides, _len))
                Fail(`Failed to get records from: ${elementContext(_id, search)}`);
        });
    },
    GetOverrides: function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetOverrides(_id, _len))
                Fail(`Failed to get overrides for: ${_id}`);
        });
    },
    GetMaster: function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetMaster(_id, _res))
                Fail(`Failed to get master for: ${_id}`);
        });
    },
    FindNextRecord: function(_id, search, byEdid, byName) {
        return GetHandle(function(_res) {
            lib.FindNextRecord(_id, wcb(search), byEdid, byName, _res);
        });
    },
    FindPreviousRecord: function(_id, search, byEdid, byName) {
        return GetHandle(function(_res) {
            lib.FindPreviousRecord(_id, wcb(search), byEdid, byName, _res);
        });
    },
    FindValidReferences: function(_id, search, limitTo) {
        return GetStringArray(function(_len) {
            if (!lib.FindValidReferences(_id, wcb(search), limitTo, _len))
                Fail(`Failed to find valid references on ${_id} searching for: ${search}`);
        });
    },
    GetReferencedBy: function(_id) {
        return GetArray(function(_len) {
            if (!lib.GetReferencedBy(_id, _len))
                Fail(`Failed to get referenced by for: ${_id}`);
        });
    },
    ExchangeReferences: function(_id, oldFormID, newFormID) {
        if (!lib.ExchangeReferences(_id, oldFormID, newFormID))
            Fail(`Failed to exchange references on ${_id} from ${oldFormID} to ${newFormID}`)
    },
    IsMaster: function(_id) {
        return GetBoolValue(_id, "IsMaster");
    },
    IsInjected: function(_id) {
        return GetBoolValue(_id, "IsInjected");
    },
    IsOverride: function(_id) {
        return GetBoolValue(_id, "IsOverride");
    },
    IsWinningOverride: function(_id) {
        return GetBoolValue(_id, "IsWinningOverride");
    },
    GetNodes: function(_id) {
        return GetHandle(function(_res) {
            if (!lib.GetNodes(_id, _res))
                Fail(`Failed to get nodes for ${_id}`);
        });
    },
    GetConflictData: function(_id1, _id2, asString = false) {
        let _res1 = createTypedBuffer(1, PByte),
            _res2 = createTypedBuffer(1, PByte);
        if (!lib.GetConflictData(_id1, _id2, _res1, _res2))
            return [0, 0];
        let n1 = _res1.readUInt8(0),
            n2 = _res2.readUInt8(0);
        return asString ? [conflictAll[n1], conflictThis[n2]] : [n1, n2];
    },
    GetConflictDataEx: function(_id1, _id2, asString = false) {
        let _res1 = createTypedBuffer(1, PByte),
            _res2 = createTypedBuffer(1, PByte);
        if (!lib.GetConflictData(_id1, _id2, _res1, _res2))
            Fail(`GetConflictData failed on ${_id1}, ${_id2}`);
        let n1 = _res1.readUInt8(0),
            n2 = _res2.readUInt8(0);
        return asString ? [conflictAll[n1], conflictThis[n2]] : [n1, n2];
    },
    GetRecordConflictData: function(_id) {
        let nodes = xelib.GetNodes(_id);
        try {
            return xelib.GetConflictDataEx(nodes, _id);
        } finally {
            xelib.ReleaseNodes(nodes);
        }
    },
    GetNodeElements: function(_id1, _id2) {
        return GetArray(function(_len) {
            if (!lib.GetNodeElements(_id1, _id2, _len))
                Fail(`GetNodeElements failed on ${_id1}, ${_id2}`);
        });
    }
});
