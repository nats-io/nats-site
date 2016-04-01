var gulp            = require('gulp'),
    debug           = require('gulp-debug'),
    notify          = require('gulp-notify'),
    concat          = require('gulp-concat'),
    rename          = require('gulp-rename'),
    watch           = require('gulp-watch'),
    less            = require('gulp-less'),
    gm              = require('gulp-gm'),
    autoprefixer    = require('gulp-autoprefixer'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    minifyCSS       = require('gulp-minify-css'),
    gulpif          = require('gulp-if');

var production = false;

// LESS
gulp.task('less', function() {
  return gulp.src('src/less/styles.less')
        .pipe(less())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('static/css'))
        .pipe(notify({ message: 'Finished compiling LESS'}));
});

// Javascript
gulp.task('js', function() {
  return gulp.src(['src/js/moment.js', 'src/js/**/*.js'])
        .pipe(concat('index.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('static/js'))
        .pipe(notify({ message: 'Finished JavaScript'}));
});

// Images
gulp.task('img', function() {
  return gulp.src('src/img/**/*')
        .pipe(gulp.dest('static/img'))
        .pipe(notify({ message: 'Finished copying image'}));
});

// Fonts
gulp.task('font', function() {
  return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('static/fonts'))
        .pipe(notify({ message: 'Finished copying font'}));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/img/**/*', ['img']);
  gulp.watch('src/font/**/*', ['font']);
});

// Default Task
gulp.task('default', ['less','js','img','font','watch']);
