'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var webserver = require('gulp-webserver'); // 静态服务器

function handleErr() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'Compile Error',
        message: '<%= error.message %>'
    }).apply(this, args);
    this.emit('end');
}

function build(watch) {

    var props = {
        entries: ['./index.js'],
        debug: true, // 生成Source map
    };

    var bundler = watch ? watchify(browserify(props)) : browserify(props);

    function bundle() {
        var stream = bundler.bundle();
        return stream
            .on('error', handleErr)
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('./build/'))
            .pipe(buffer()) // 转换格式
            .pipe(uglify()) // 压缩
            .pipe(rename({ suffix: '.min' })) // 压缩后的文件名
            .pipe(gulp.dest('./build/')); // 输出
    }

    // 监听文件更新
    bundler.on('update', function() {
        bundle();
        gutil.log('Rebundle @ ' + new Date().toLocaleString());
    });

    return bundle();
}

// // build一次后，监听文件变化，动态build
// gulp.task('default', ['build'], function() {
//     return build(true);
// });

// // build一次
// gulp.task('build', function() {
//     return build(false);
// });

// 启动Web服务
gulp.task('webserver', function() {
  return gulp.src('./')
    .pipe(webserver({
      open: true,
      host: '127.0.0.1',
      //https: true,
      port: 8000,
      path: '/',
      // livereload: true, // 自动刷新
      directoryListing: true
    }));
});

// build一次后，监听文件变化，动态build
gulp.task('default', ['webserver'], function() {
    return build(true);
});