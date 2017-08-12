// ENUMERATIONS
var conflictThis = [ 'ctUnknown', 'ctIgnored', 'ctNotDefined', 'ctIdenticalToMaster', 'ctOnlyOne', 'ctHiddenByModGroup', 'ctMaster', 'ctConflictBenign', 'ctOverride', 'ctIdenticalToMasterWinsConflict','ctConflictWins', 'ctConflictLoses'];
var conflictAll = [ 'caUnknown', 'caOnlyOne', 'caNoConflict', 'caConflictBenign', 'caOverride', 'caConflict', 'caConflictCritical'];

applyEnums(xelib, conflictThis);
applyEnums(xelib, conflictAll);

// RECORD HANDLING METHODS
xelib.GetFormID = function(_id, local = false) {
    var _res = createTypedBuffer(4, PCardinal);
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
xelib.ExchangeReferences = function(_id, oldFormID, newFormID) {
    if (!lib.ExchangeReferences(_id, oldFormID, newFormID))
        Fail(`Failed to exchange references on ${_id} from ${oldFormID} to ${newFormID}`)
};
xelib.GetReferencedBy = function(_id) {
    return GetArray(function(_len) {
        if (!lib.GetReferencedBy(_id, _len))
            Fail(`Failed to get referenced by for: ${_id}`);
    });
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
xelib.ConflictThis = function(_id, asString = false) {
    return GetEnumValue(_id, 'ConflictThis', asString && conflictThis);
};
xelib.ConflictAll = function(_id, asString = false) {
    return GetEnumValue(_id, 'ConflictAll', asString && conflictAll);
};