import {lib, xelib} from './lib';
import {GetString} from './helpers';

// MESSAGE METHODS
xelib.GetMessages = function() {
    return GetString(function(_len) {
        lib.GetMessagesLength(_len);
    }, 'GetMessages');
};
xelib.ClearMessages = function() {
    lib.ClearMessages();
};
xelib.GetExceptionMessage = function() {
    return GetString(function(_len) {
        lib.GetExceptionMessageLength(_len);
    }, 'GetExceptionMessage');
};
