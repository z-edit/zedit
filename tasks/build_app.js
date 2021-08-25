'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const wait = require('gulp-wait');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const utils = require('./utils');

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const jsDir = srcDir.cwd('./javascripts');
const destDir = jetpack.cwd('./app');

gulp.task('bundle', function() {
    return Promise.all([
        bundle(jsDir.path('main.js'), destDir.path('main.js')),
        bundle(jsDir.path('app.js'), destDir.path('app.js')),
        bundle(jsDir.path('progress.js'), destDir.path('progress.js'))
    ]);
});

gulp.task('sass', function() {
    return gulp.src(srcDir.path('stylesheets/themes/*'))
        .pipe(plumber())
        .pipe(wait(250))
        .pipe(sass())
        .pipe(gulp.dest('themes'));
});

gulp.task('copySyntaxThemes', function() {
    return gulp.src('node_modules/codemirror/theme/*.css')
        .pipe(gulp.dest('syntaxThemes'));
});

gulp.task('environment', function(done) {
    let configFile = 'config/env_' + utils.getEnvName() + '.json';
    projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
    done();
});

gulp.task('watch', function() {
    let beepOnError = function (done) {
        return function (err) {
            if (err) {
                utils.beepSound();
            }
            done(err);
        };
    };

    gulp.watch('src/**/*.js', batch(function (events, done) {
        gulp.start('bundle', beepOnError(done));
    }));
    gulp.watch('src/**/*.scss', batch(function (events, done) {
        gulp.start('sass', beepOnError(done));
    }));
});

gulp.task('build', gulp.series('bundle', 'sass', 'copySyntaxThemes', 'environment'));
