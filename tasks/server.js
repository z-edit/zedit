const gulp = require('gulp');
const server = require("browser-sync").create();

gulp.task("server", function () {
    server.init({
        port: 8081,
        files: './themes',
        localOnly: true,
        server: "app/",
        notify: false,
        open: false,
        ui: false
    });

    gulp.watch('src/**/*.scss', gulp.task('sass'));
});
