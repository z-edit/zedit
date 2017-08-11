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
    var len = createTypedBuffer(4, PInteger);
    if (!lib.GetExceptionMessageLength(len) || len == 0)
        return '';
    var str = createTypedBuffer(2 * len, PWChar);
    lib.GetExceptionMessage(str, len);
    return readPWCharString(str);
};