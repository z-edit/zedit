// helper functions
let createTypedBuffer = function(size, type) {
    let buf = new Buffer(size);
    buf.type = type;
    return buf;
};

let readPWCharString = function(buf) {
    return wchar_t.toString(buf);
};

let readCardinalArray = function(buf, len) {
    let a = [];
    for (let i = 0; i < 4 * len; i+=4)
        a.push(buf.readUInt32LE(i));
    return a;
};

let wcb = function(value) {
    let buf = new Buffer((value.length + 1) * 2);
    buf.write(value, 0, 'ucs2');
    buf.type = PWChar;
    return buf;
};

let elementContext = function(_id, path) {
    return `${_id}, "${path}"`;
};

let flagContext = function(_id, path, name) {
    return `${_id}, "${path}\\${name}"`;
};

let Fail = function(message) {
    try {
        let libMessage = xelib.GetExceptionMessage();
        if (libMessage) {
            console.log(libMessage);
            message +=  '\r\n' + libMessage;
        }
    } catch (e) {
        console.log('Unknown critical exception!');
    }
    throw message;
};

let GetString = function(callback, method = 'GetResultString') {
    let _len = createTypedBuffer(4, PInteger);
    callback(_len);
    let len = _len.readInt32LE(0);
    if (len < 1) return '';
    let str = createTypedBuffer(2 * len, PWChar);
    if (!lib[method](str, len))
        Fail(`${method} failed.`);
    return readPWCharString(str);
};

let GetHandle = function(callback) {
    let _res = createTypedBuffer(4, PCardinal);
    callback(_res);
    let handle = _res.readUInt32LE(0);
    if (xelib.HandleGroup) xelib.HandleGroup.push(handle);
    return handle;
};

let GetInteger = function(callback) {
    let _res = createTypedBuffer(4, PInteger);
    callback(_res);
    return _res.readInt32LE(0);
};

let GetBool = function(callback) {
    let _bool = createTypedBuffer(2, PWordBool);
    callback(_bool);
    return _bool.readUInt16LE(0) > 0;
};

let GetByte = function(callback) {
    let _res = createTypedBuffer(1, PByte);
    callback(_res);
    return _res.readUInt8(0);
};

let GetEnum = function(callback, enums) {
    return enums[GetByte(callback)];
};

let GetArray = function(callback) {
    let _len = createTypedBuffer(4, PInteger);
    callback(_len);
    let len = _len.readInt32LE(0);
    if (len < 1) return [];
    let buf = createTypedBuffer(4 * len, PCardinal);
    if (!lib.GetResultArray(buf, len))
        Fail('GetResultArray failed');
    let a = readCardinalArray(buf, len);
    if (xelib.HandleGroup) a.forEach((h) => xelib.HandleGroup.push(h));
    return a;
};

let GetDictionary = function(_len) {
    let str = GetString(_len),
        pairs = str.split('\n').slice(0, -1),
        dictionary = {};
    pairs.forEach(function(pair) {
        let n = pair.indexOf('=');
        dictionary[pair.substr(0, n)] = pair.substr(n + 1, pair.length);
    });
    return dictionary;
};

let GetBoolValue = function(_id, method) {
    return GetBool(function(_bool) {
        if (!lib[method](_id, _bool))
            Fail(`Failed to call ${method} on ${_id}`);
    });
};

let GetStringValue = function(_id, method) {
    return GetString(function(_len) {
        if (!lib[method](_id, _len))
            Fail(`${method} failed on ${_id}`);
    });
};

let GetEnumValue = function(_id, method, enums) {
    let n = GetByte(function(_byte) {
        if (!lib[method](_id, _byte))
            Fail(`${method} failed on ${_id}`);
    });
    return enums && enums[n] || n;
};

let GetNativeValue = function(_id, path, method, refType) {
    let buff = createTypedBuffer(refType == PDouble ? 8 : 4, refType);
    if (!lib[method](_id, wcb(path), buff))
        Fail(`Failed to ${method} at: ${elementContext(_id, path)}`);
    return buff;
};

let SetNativeValue = function(_id, path, method, value) {
    if (value === undefined) {
        value = path;
        path = '';
    }
    if (!lib[method](_id, wcb(path), value))
        Fail(`Failed to ${method} to ${value} at: ${elementContext(_id, path)}`);
};

let applyEnums = function(context, enums, label) {
    enums.forEach((value, ord) => context[value] = ord);
    context[label] = enums;
};