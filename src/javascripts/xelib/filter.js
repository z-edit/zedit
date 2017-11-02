import { lib } from './lib';
import { Fail } from './helpers';

// GROUP HANDLING METHODS
Object.assign(xelib, {
    FilterRecord: function(id) {
        if (!lib.FilterRecord(id))
            Fail(`Failed to filter record ${xelib.Name(id)}`);
    },
    ResetFilter: function() {
        if (!lib.ResetFilter())
            Fail('Failed to reset filter')
    }
});
