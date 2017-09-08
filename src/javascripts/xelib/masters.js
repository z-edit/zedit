import {lib, xelib} from './lib';
import {Fail, GetArray, GetStringArray, wcb} from './helpers';


// MASTER HANDLING METHODS
xelib.CleanMasters = function(_id) {
    if (!lib.CleanMasters(_id))
        Fail(`Failed to clean masters in: ${_id}`);
};
xelib.SortMasters = function(_id) {
    if (!lib.SortMasters(_id))
        Fail(`Failed to sort masters in: ${_id}`);
};
xelib.AddMaster = function(_id, filename) {
    if (!lib.AddMaster(_id, wcb(filename)))
        Fail(`Failed to add master "${filename}" to file: ${_id}`);
};
xelib.GetMasters = function(_id) {
    return GetArray(function(_len) {
        if (!lib.GetMasters(_id, _len))
            Fail(`Failed to get masters for ${_id}`);
    });
};
xelib.GetMasterNames = function(_id) {
    return GetStringArray(function(_len) {
        if (!lib.GetMasterNames(_id, _len))
            Fail(`Failed to get master names for ${_id}`);
    });
};
