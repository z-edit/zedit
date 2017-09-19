import { lib } from './lib';
import { GetString, Fail } from './helpers';

// ERROR CHECKING METHODS
Object.assign(xelib, {
    CheckForErrors: function(_id) {
        if (!lib.CheckForErrors(_id))
            Fail(`Failed to check ${_id} for errors.`);
    },
    GetErrorThreadDone: function() {
        return lib.GetErrorThreadDone();
    },
    GetErrors: function() {
        let str = GetString(function(_len) {
            if (!lib.GetErrors(_len))
                Fail('Failed to get errors');
        });
        return JSON.parse(str).errors;
    },
    RemoveIdenticalRecords: function(_id, removeITMs = true, removeITPOs = true) {
        if (!lib.RemoveIdenticalRecords(_id, removeITMs, removeITPOs))
            Fail(`Failed to remove identical errors from ${_id}`);
    }
});
