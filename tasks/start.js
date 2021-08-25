'use strict';

const childProcess = require('child_process');
const electron = require('electron');
const gulp = require('gulp');

function getApp(inputArgs) {
    let args = ['.'];
    if (Array.isArray(inputArgs))
        inputArgs.forEach(arg => args.push(arg));

    return function app(done) {
        childProcess.spawn(electron, args, {
            stdio: 'inherit'
        }).on('close', function () {
            process.exit();
            done();
        });
    };
}

gulp.task('start', gulp.series(
    'build',
    gulp.parallel(
        'watch',
        getApp()
    )
));

gulp.task('start-debug', gulp.series(
    'build',
    gulp.parallel(
        'watch',
        getApp(["-dev", "--external-debugger", "--debug-progress"])
    )
));

