'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var nodemon = require('gulp-nodemon');

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



// This section configures browser-sync and express to co-exist and allows
// things such as:
// - Restart server when core server files are modified
// This ability is not possible by simply running the serve task above.
// See https://github.com/sogko/gulp-recipes/tree/master/browser-sync-nodemon-expressjs.

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({

    // nodemon our expressjs server
    script: 'index.js',

    // watch core server file(s) that require server restart on change
    watch: ['index.js','my_modules/app.js']
  })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('serve-dual', ['nodemon'], function () {
  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync({

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:5000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000

    // WARNING: this instruction below from sogko is not working; not only it does not load
    // the proxied app in chrome but prevents browser-sync app from loading the web page in the browser
    // open the proxied app in chrome
    // browser: ['google-chrome']
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
