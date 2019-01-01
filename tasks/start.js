'use strict';

const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');

gulp.task('start', gulp.series('build', gulp.parallel('watch', function app(done) {
    childProcess.spawn(electron, ['.'], {
        stdio: 'inherit'
    }).on('close', function () {
        process.exit();
        done();
    });
})));
