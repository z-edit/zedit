import { lib, xelib } from './lib';
import { GetString, Fail } from './helpers';

// SERIALIZATION METHODS
Object.assign(xelib, {
    ElementToJSON: function(_id) {
        return GetString(function(_len) {
            if (!lib.ElementToJson(_id, _len))
                Fail(`Failed to serialize element to JSON: ${_id}`);
        });
    },
    ElementToObject: function(_id) {
        return JSON.parse(this.ElementToJSON(_id));
    }
});