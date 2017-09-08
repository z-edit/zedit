const wchar_t = require('ref-wchar');
const ref = require('ref');

export const Void = 'void';
export const WString = wchar_t.string;
export const Cardinal = ref.types.uint32;
export const WordBool = ref.types.uint16;
export const Integer = ref.types.int32;
export const Double = ref.types.double;
export const Byte = ref.types.byte;
export const PWChar = ref.refType(WString);
export const PCardinal = ref.refType(Cardinal);
export const PInteger = ref.refType(Integer);
export const PWordBool = ref.refType(WordBool);
export const PDouble = ref.refType(Double);
export const PByte = ref.refType(Byte);
