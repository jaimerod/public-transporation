var browserify = require('browserify');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var reactify = require('reactify');
var sass = require('gulp-ruby-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync').create();

// Source Folders
var imageFolder = 'src/images';
var jsFolder = 'src/js';
var mainSassFile = 'src/main.scss';
var sassFolder = 'src/scss';

// Build Folders
var buildCssFolder = 'src/build/css';
var buildImageFolder = 'src/build/img';
var buildJsFolder = 'src/build/js';

/**
 * Error handler for notify
 */
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
}

/**
 * Builds the scripts
 */
function buildScript(file, watch) {
  var props = {
    entries: [jsFolder + '/' + file],
    debug : true,
    transform:  [reactify]
  };

  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest(buildJsFolder + '/'))
      .pipe(livereload());
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    console.log('Rebundle...');
  });

  return rebundle();
}

gulp.task('scripts', function() {
  return buildScript('app.js', false);
});

gulp.task('watch-scripts', function () {
  return buildScript('app.js', true);
});

/**
 * Compiles SCSS to CSS and minifies CSS
 */
gulp.task('styles', function () {
 var sassOptions = {
    'sourcemap': true,
    'style': 'compressed'
  };

  return sass(sassFolder + '/**/*.scss', sassOptions)
    .on('error', function (err) {
        console.error("Error", err.message);
    })
    .pipe(sourcemaps.init({debug: true}))
    .pipe(sourcemaps.write('./', {
      includeContent: true,
      sourceRoot: './'
    }))
    .pipe(gulp.dest( buildCssFolder))
    .pipe(livereload());
});

/**
 * Watchs for changes in files
 */
gulp.task('watch', function () {
  var server = livereload.listen();
  buildScript('app.js', true);
  gulp.watch([sassFolder + '/**/*.scss'], ['styles']);

  browserSync.init({
      server: {
          baseDir: "src/"
      }
  });
});

/**
 * Default Gulp task. Runs tasks first, then watch for future changes
 */
gulp.task('default', ['scripts', 'styles', 'watch'], function() {
});