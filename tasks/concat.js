var jetpack = require('fs-jetpack');
var path = require('path');
var os = require('os');
var MagicString = require('magic-string');

var options = {};

var ensureTrailingNewLine = function(code) {
  if (!code.endsWith(os.EOL)) code += os.EOL;
  return code;
};

var load = function(path) {
    if (!jetpack.exists(path)) console.log(`ERROR: File not found at "${path}"`);
    let code = ensureTrailingNewLine(jetpack.read(path));
    const magicStr = new MagicString(code);
    concatFiles(magicStr, code, path);
    return magicStr.toString();
};

var loadTree = function(path) {
    return jetpack.find(path, { matching: '*.js' }).reduce(function(code, filePath) {
        return code + load(filePath);
    }, '');
};

var concatFiles = function(magicStr, code, id) {
    var dir = path.dirname(id),
        regex = /\/\/= concat(_tree)? ([^\n\r]+)/gi,
        changes = false;
    code.replace(regex, function(match, tree, target, index) {
        if (options.debug) console.log(`rollup-plugin-concat: processing "${match}" in "${id}"`);
        changes = true;
        var targetPath = path.join(dir, target);
        var insertedCode = (tree ? loadTree(targetPath) : load(targetPath));
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
            var magicStr = new MagicString(code);
            var changes = concatFiles(magicStr, code, id);
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