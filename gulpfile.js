var gulp         = require('gulp'),
    debug        = require('gulp-debug'),
    notify       = require('gulp-notify'),
    concat       = require('gulp-concat'),
    rename       = require('gulp-rename'),
    watch        = require('gulp-watch'),
    less         = require('gulp-less'),
    uglify       = require('gulp-uglify'),
    minifyCSS    = require('gulp-minify-css'),
    gm           = require('gulp-gm'),
    imageResize  = require('gulp-image-resize'),
    gulpif       = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps');

// LESS
gulp.task('less', function() {
  return gulp.src('src/less/styles.less')
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    //.pipe(minifyCSS())
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

// Resize User Logos
gulp.task('userLogos', function() {
  return gulp.src('src/user_logos/**/*')
    .pipe(gm(function (gmfile) {
      return gmfile.resize(150, 100);
    }))
    .pipe(gulp.dest('static/img/user_logos'))
    .pipe(notify({ message: 'Finished resizing image'}));
});

// Resize Partner Logos
gulp.task('partnerLogos', function() {
  return gulp.src('src/partner_logos/**/*')
    .pipe(gm(function (gmfile) {
      return gmfile.resize(250, 150);
    }))
    .pipe(gulp.dest('static/img/partner_logos'))
    .pipe(notify({ message: 'Finished resizing partner logo'}));
});

// Resize Documentaiton Images
gulp.task('docsImages', function() {
  return gulp.src('src/documentation/**/*.{png,jpg,jpeg}')
    .pipe(gulp.dest('static/img/documentation'))
    .pipe(notify({ message: 'Finished copying documentation image'}));
});

// Resize Blog Images
gulp.task('blogImages', function() {
  return gulp.src('src/blog/**/*.{png,jpg,jpeg}')
    .pipe(imageResize({
      width : 900
    }))
    .pipe(gulp.dest('static/img/blog'))
    .pipe(notify({ message: 'Finished resizing blog image'}));
});

// Will have to improve this later on
gulp.task('blogImagesGifs', function() {
  return gulp.src('src/blog/**/*.gif')
    .pipe(gulp.dest('static/img/blog'))
    .pipe(notify({ message: 'Finished copying gif blog image'}));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/less/**/*.less', [ 'less' ]);
  gulp.watch('src/js/**/*.js', [ 'js' ]);
  gulp.watch('src/img/**/*', [ 'img' ]);
  gulp.watch('src/font/**/*', [ 'font' ]);
  gulp.watch('src/user_logos/**/*', [ 'userLogos' ]);
  gulp.watch('src/partner_logos/**/*', [ 'partnerLogos' ]);
  gulp.watch('src/blog/**/*', [ 'blogImages' ]);
  gulp.watch('src/blog/**/*', [ 'blogImagesGifs' ]);
});

// Default Task
gulp.task('default', [ 'less','js','img','font','watch', 'docsImages', 'userLogos', 'partnerLogos', 'blogImages', 'blogImagesGifs', 'watch' ]);
