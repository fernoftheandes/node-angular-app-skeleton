'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format())
  };
}
const testLintOptions = {
  globals: {
    assert: false,
    expect: false,
    should: false
  }
};

// lint js files
// NOTE: very important to have a .eslintignore file in place
// to avoid linting 3rd party libraries
gulp.task('lint', lint('app/scripts/**/*.js'));

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/index.html')
    .pipe(wiredep({
      directory: 'bower_components',
      // avoids hierarchy problems when injecting bower components, e.g. ../bower_components
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

// browserifying the main js app
gulp.task('browserify', function() {
  // Grabs the app.js file
  return browserify('./app/scripts/app.js')
    // bundles it and creates a file called main.js
    .bundle()
    .pipe(source('main.js'))
    // saves it to the app/scripts/ directory
    .pipe(gulp.dest('./app/scripts/'));
})

// starting local web server with browser-sync
// NOTE: alternatively can run hosted by node with command-line:
// node index.js --port=5000 (or any other port number)
gulp.task('serve', function() {
  browserSync({
    notify: false,
    port: 5000,
    server: {
      baseDir: ['app'],
      // this is incredibly useful, allowing the flexibility to serve
      // files outside of the application root directory ('/app', in this case)
      routes: {
        '/bower_components': 'bower_components',
        '/lib': 'lib'
      }
    }
  });

  // watch for any changes in these directories/files and reload browser
  gulp.watch([
    'app/**/*.html',
    'app/scripts/main.js'
  ]).on('change', browserSync.reload);

  // watch for changes in these directories/files and run task(s)
  gulp.watch('bower.json', ['wiredep']);
  // TODO: currently having to specify the exact filename rather than a directory such as app/**/*.js BECAUSE
  // I am currently putting the browserified file BACK INTO THE SAME DIRECTORY as the source js file
  gulp.watch(['app/scripts/app.js','app/controllers/**/*.js'], ['browserify']);
});
