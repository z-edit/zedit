import {lib, xelib} from './lib';
import {GetString, Fail} from './helpers';

// ERROR CHECKING METHODS
xelib.CheckForErrors = function(_id) {
    if (!lib.CheckForErrors(_id))
        Fail(`Failed to check ${_id} for errors.`);
};
xelib.GetErrorThreadDone = function() {
    return lib.GetErrorThreadDone();
};
xelib.GetErrors = function() {
    let str = GetString(function(_len) {
        if (!lib.GetErrors(_len))
            Fail('Failed to get errors');
    });
    return JSON.parse(str).errors;
};
