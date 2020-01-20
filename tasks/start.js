'use strict';

const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');

function app(done) {

    childProcess.spawn(electron, ['.'], {
        stdio: 'inherit'
    }).on('close', function () {
        process.exit();
        done();
    });
}

gulp.task('start', gulp.series('build', gulp.parallel('watch', app)));

gulp.task('start-debug', gulp.series('build-debug', gulp.parallel('watch', app)));

