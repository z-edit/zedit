import { lib, xelib } from './lib';
import { GetString } from './helpers';

// MESSAGE METHODS
Object.assign(xelib, {
    GetMessages: function() {
        return GetString(function(_len) {
            lib.GetMessagesLength(_len);
        }, 'GetMessages');
    },
    ClearMessages: function() {
        lib.ClearMessages();
    },
    GetExceptionMessage: function() {
        return GetString(function(_len) {
            lib.GetExceptionMessageLength(_len);
        }, 'GetExceptionMessage');
    }
});
