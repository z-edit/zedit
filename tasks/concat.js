const jetpack = require('fs-jetpack');
const path = require('path');
const os = require('os');
const MagicString = require('magic-string');

let options = {};

let ensureTrailingNewLine = function(code) {
  if (!code.endsWith(os.EOL)) code += os.EOL;
  return code;
};

let load = function(path) {
    if (!jetpack.exists(path)) console.log(`ERROR: File not found at "${path}"`);
    let code = ensureTrailingNewLine(jetpack.read(path));
    const magicStr = new MagicString(code);
    concatFiles(magicStr, code, path);
    return magicStr.toString();
};

let loadTree = function(path) {
    return jetpack.find(path, { matching: '*.js' }).reduce(function(code, filePath) {
        return code + load(filePath);
    }, '');
};

let concatFiles = function(magicStr, code, id) {
    let dir = path.dirname(id),
        regex = /\/\/= concat(_tree)? ([^\n\r]+)/gi,
        changes = false;
    code.replace(regex, function(match, tree, target, index) {
        if (options.debug) console.log(`rollup-plugin-concat: processing "${match}" in "${id}"`);
        changes = true;
        let targetPath = path.join(dir, target);
        let insertedCode = (tree ? loadTree(targetPath) : load(targetPath));
        magicStr.overwrite(index, index + match.length, insertedCode);
        return insertedCode;
    });
    return changes;
};

module.exports = function(opts) {
    if (opts) options = opts;
    return {
        name: 'concat',
        transform: function(code, id) {
            let magicStr = new MagicString(code);
            let changes = concatFiles(magicStr, code, id);
            if (changes) {
              return {
                  code: magicStr.toString(),
                  map: magicStr.generateMap({ hires: true })
              };
            }

            return null; // tell rollup to discard this result
        }
    };
};
