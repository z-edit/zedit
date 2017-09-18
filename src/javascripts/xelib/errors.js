import { lib } from './lib';
import { GetString, Fail } from './helpers';

// ERROR CHECKING METHODS
Object.assign(xelib, {
    CheckForErrors: function(id) {
        if (!lib.CheckForErrors(id))
            Fail(`Failed to check ${id} for errors.`);
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
    RemoveIdenticalRecords: function(id) {
        if (!lib.RemoveIdenticalRecords(id))
            Fail(`Failed to remove identical errors from ${id}`);
    }
});
