'use strict';

const gulp = require('gulp');
const include = require('gulp-include');
const rollup = require('gulp-rollup');
const jetpack = require('fs-jetpack');
const path = require('path');

const nodeBuiltInModules = ['assert', 'buffer', 'child_process', 'cluster',
    'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events',
    'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'punycode',
    'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers',
    'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

const electronBuiltInModules = ['electron'];

const rollupPlugins = [];

let generateExternalModulesList = function() {
    let appManifest = jetpack.read('./package.json', 'json');
    return [].concat(
        nodeBuiltInModules,
        electronBuiltInModules,
        Object.keys(appManifest.dependencies),
        Object.keys(appManifest.devDependencies)
    );
};

let cached = {};

module.exports = function(src, dest) {
    return gulp.src('./src/javascripts/**/*.js')
        .pipe(include())
        .pipe(rollup({
            input: src,
            external: generateExternalModulesList(),
            cache: cached[src],
            plugins: rollupPlugins,
            format: 'cjs'
        }))
        .on('bundle', function(bundle) {
            cached[src] = bundle;

            let jsFile = path.basename(dest);
            return bundle.generate({
                format: 'cjs',
                sourcemap: true,
                sourcemapFile: jsFile
            }).then(function(result) {
                let isolatedCode = `(function () {${result.code}\n}());`;
                let sourceMapInfo = `//# sourceMappingURL=${jsFile}.map`;
                jetpack.write(dest, `${isolatedCode}\n${sourceMapInfo}`);
                jetpack.write(`${dest}.map`, result.map.toString());
            });
        });
};
