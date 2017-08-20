// helper functions
var createTypedBuffer = function(size, type) {
    var buf = new Buffer(size);
    buf.type = type;
    return buf;
};

var readPWCharString = function(buf) {
    return wchar_t.toString(buf);
};

var readCardinalArray = function(buf, len) {
    var a = [];
    for (var i = 0; i < 4 * len; i+=4)
        a.push(buf.readUInt32LE(i));
    return a;
};

var wcb = function(value) {
    var buf = new Buffer((value.length + 1) * 2);
    buf.write(value, 0, 'ucs2');
    buf.type = PWChar;
    return buf;
};

var elementContext = function(_id, path) {
    return `${_id}, "${path}"`;
};

var flagContext = function(_id, path, name) {
    return `${_id}, "${path}\\${name}"`;
};

var Fail = function(message) {
    try {
        var libMessage = xelib.GetExceptionMessage();
        if (libMessage) console.log(libMessage);
    } catch (e) {
        console.log('Unknown critical exception!');
    }
    throw message;
};

var GetString = function(callback, method = 'GetResultString') {
    var _len = createTypedBuffer(4, PInteger);
    callback(_len);
    var len = _len.readInt32LE(0);
    if (len == 0) return '';
    var str = createTypedBuffer(2 * len, PWChar);
    if (!lib[method](str, len))
        Fail(`${method} failed.`);
    return readPWCharString(str);
};

var GetHandle = function(callback) {
    var _res = createTypedBuffer(4, PCardinal);
    callback(_res);
    return _res.readUInt32LE(0);
};

var GetInteger = function(callback) {
    var _res = createTypedBuffer(4, PInteger);
    callback(_res);
    return _res.readInt32LE(0);
};

var GetBool = function(callback) {
    var _bool = createTypedBuffer(2, PWordBool);
    callback(_bool);
    return _bool.readUInt16LE(0) > 0;
};

var GetArray = function(callback) {
    var _len = createTypedBuffer(4, PInteger);
    callback(_len);
    var len = _len.readInt32LE(0);
    if (len == 0) return [];
    var a = createTypedBuffer(4 * len, PCardinal);
    if (!lib.GetResultArray(a, len))
        Fail('GetResultArray failed');
    return readCardinalArray(a, len);
};

var GetDictionary = function(_len) {
    var str = GetString(_len);
    var pairs = str.split('\n').slice(0, -1);
    var dictionary = {};
    pairs.forEach(function(pair) {
        var n = pair.indexOf('=');
        dictionary[pair.substr(0, n)] = pair.substr(n + 1, pair.length);
    });
    return dictionary;
};

var GetBoolValue = function(_id, method) {
    return GetBool(function(_bool) {
        if (!lib[method](_id, _bool))
            Fail(`Failed to call ${method} on ${_id}`);
    });
};

var GetStringValue = function(_id, method) {
    return GetString(function(_len) {
        if (!lib[method](_id, _len))
            Fail(`${method} failed on ${_id}`);
    });
};

var GetEnumValue = function(_id, method, enums) {
    var _res = createTypedBuffer(1, PByte);
    if (!lib[method](_id, _res))
        Fail(`${method} failed on ${_id}`);
    let n = _res.readUInt8(0);
    return enums && enums[n] || n;
};

var GetNativeValue = function(_id, path, method, refType) {
    var buff = createTypedBuffer(refType == PDouble ? 8 : 4, refType);
    if (!lib[method](_id, wcb(path), buff))
        Fail(`Failed to ${method} at: ${elementContext(_id, path)}`);
    return buff;
};

var SetNativeValue = function(_id, path, method, value) {
    if (value === undefined) {
        value = path;
        path = '';
    }
    if (!lib[method](_id, wcb(path), value))
        Fail(`Failed to ${method} to ${value} at: ${elementContext(_id, path)}`);
};

var applyEnums = function(context, enums, label) {
    enums.forEach((value, ord) => context[value] = ord);
    context[label] = enums;
};