const wchar_t = require('ref-wchar');

import { lib } from './lib';
import { PWChar, PCardinal, PInteger, PWordBool, PDouble, PByte} from './types';

// HELPER FUNCTIONS
export let createTypedBuffer = function(size, type) {
    let buf = Buffer.alloc(size, 0);
    buf.type = type;
    return buf;
};

export let readPWCharString = function(buf) {
    return wchar_t.toString(buf);
};

export let readCardinalArray = function(buf, len) {
    let a = [];
    for (let i = 0; i < 4 * len; i += 4)
        a.push(buf.readUInt32LE(i));
    return a;
};

export let wcb = function(value) {
    let buf = Buffer.alloc((value.length + 1) * 2, 0);
    buf.write(value, 0, 'ucs2');
    buf.type = PWChar;
    return buf;
};

export let elementContext = function(_id, path) {
    return `${_id}, "${path}"`;
};

export let arrayItemContext = function(_id, path, subpath, value) {
    return `${_id}: ${path}, ${subpath}, ${value}`;
};

export let flagContext = function(_id, path, name) {
    return `${_id}, "${path}\\${name}"`;
};

export let Fail = function(message) {
    try {
        let libMessage = xelib.GetExceptionMessage();
        if (libMessage) message +=  '\r\n' + libMessage;
    } catch (e) {
        console.log('Unknown critical exception!');
    }
    throw new Error(message);
};

export let GetString = function(callback, method = 'GetResultString') {
    let _len = createTypedBuffer(4, PInteger);
    callback(_len);
    let len = _len.readInt32LE(0);
    if (len < 1) return '';
    let str = createTypedBuffer(2 * len, PWChar);
    if (!lib[method](str, len))
        Fail(`${method} failed.`);
    return readPWCharString(str);
};

export let GetHandle = function(callback) {
    let _res = createTypedBuffer(4, PCardinal);
    callback(_res);
    let handle = _res.readUInt32LE(0);
    if (xelib.HandleGroup) xelib.HandleGroup.push(handle);
    return handle;
};

export let GetInteger = function(callback) {
    let _res = createTypedBuffer(4, PInteger);
    callback(_res);
    return _res.readInt32LE(0);
};

export let GetBool = function(callback) {
    let _bool = createTypedBuffer(2, PWordBool);
    callback(_bool);
    return _bool.readUInt16LE(0) > 0;
};

export let GetByte = function(callback) {
    let _res = createTypedBuffer(1, PByte);
    callback(_res);
    return _res.readUInt8(0);
};

export let GetEnum = function(callback, enums) {
    return enums[GetByte(callback)];
};

export let GetArray = function(callback) {
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

export let GetStringArray = function(callback, method = 'GetResultString') {
    let str = GetString(callback, method);
    return str !== '' ? str.split('\r\n') : [];
};

export let GetDictionary = function(callback, method = 'GetResultString') {
    let pairs = GetStringArray(callback, method),
        dictionary = {};
    pairs.forEach(function(pair) {
        let n = pair.indexOf('=');
        dictionary[pair.substr(0, n)] = pair.substr(n + 1, pair.length);
    });
    return dictionary;
};

export let GetBoolValue = function(_id, method) {
    return GetBool(function(_bool) {
        if (!lib[method](_id, _bool))
            Fail(`Failed to call ${method} on ${_id}`);
    });
};

export let GetStringValue = function(_id, method) {
    return GetString(function(_len) {
        if (!lib[method](_id, _len))
            Fail(`${method} failed on ${_id}`);
    });
};

export let GetEnumValue = function(_id, method) {
    return GetByte(function(_byte) {
        if (!lib[method](_id, _byte))
            Fail(`${method} failed on ${_id}`);
    });
};

export let GetNativeValue = function(_id, path, method, refType) {
    let buff = createTypedBuffer(refType === PDouble ? 8 : 4, refType);
    lib[method](_id, wcb(path), buff);
    return buff;
};

export let GetNativeValueEx = function(_id, path, method, refType) {
    let buff = createTypedBuffer(refType === PDouble ? 8 : 4, refType);
    if (!lib[method](_id, wcb(path), buff))
        Fail(`Failed to ${method} for ${elementContext(_id, path)}`);
    return buff;
};

export let SetNativeValue = function(_id, path, method, value) {
    if (value === undefined) {
        value = path;
        path = '';
    }
    if (!lib[method](_id, wcb(path), value))
        Fail(`Failed to ${method} to ${value} at: ${elementContext(_id, path)}`);
};

export let applyEnums = function(context, enums, label) {
    enums.forEach((value, ord) => context[value] = ord);
    context[label] = enums;
};
