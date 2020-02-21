var gulp         = require('gulp'),
    concat       = require('gulp-concat'),
    // watch        = require('gulp-watch'),
    less         = require('gulp-less'),
    uglify       = require('gulp-uglify'),
    minifyCSS    = require('gulp-clean-css'),
    gm           = require('gulp-gm'),
    imageResize  = require('gulp-image-resize'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    clean        = require('gulp-clean'),
    shell        = require('gulp-shell'),
    runSequence  = require('run-sequence');

// LESS
gulp.task('less', function() {
  return gulp.src('src/less/styles.less')
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/css'));
});

gulp.task('css', function() {
  return gulp.src('src/css/**/*.css')
      .pipe(gulp.dest('static/css'));
});

// Javascript
gulp.task('js', function() {
  return gulp.src(['src/js/anchor.js', 'src/js/moment.js', 'src/js/**/*.js'])
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/js'));
});

// Images
gulp.task('img', function() {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('static/img'));
});

// Fonts
gulp.task('font', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('static/fonts'));
});

// Resize User Logos
gulp.task('userLogos', function() {
  return gulp.src('src/user_logos/**/*')
    .pipe(gm(function (gmfile) {
      return gmfile.resize(150, 100);
    }))
    .pipe(gulp.dest('static/img/user_logos'));
});

// Resize Partner Logos
gulp.task('partnerLogos', function() {
  return gulp.src('src/partner_logos/**/*')
    .pipe(gm(function (gmfile) {
      return gmfile.resize(250, 150);
    }))
    .pipe(gulp.dest('static/img/partner_logos'));
});

// Resize Documentaiton Images
gulp.task('docsImages', function() {
  return gulp.src('src/documentation/**/*.{png,jpg,jpeg}')
    .pipe(gulp.dest('static/img/documentation'));
});

// Resize Blog Images
gulp.task('blogImages', function() {
  return gulp.src('src/blog/**/*.{png,jpg,jpeg}')
    .pipe(imageResize({
      width : 900
    }))
    .pipe(gulp.dest('static/img/blog'));
});

// Will have to improve this later on
gulp.task('blogImagesGifs', function() {
  return gulp.src('src/blog/**/*.gif')
    .pipe(gulp.dest('static/img/blog'));
});

// Will have to improve this later on
gulp.task('collateral', function() {
  return gulp.src('src/collateral/*')
    .pipe(gulp.dest('static/collateral'));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['public', 'static'], {read: false})
    .pipe(clean());
});

// HUGO
gulp.task('hugo', shell.task('hugo --minify'));

// OpenPGP WKD
// <https://datatracker.ietf.org/doc/draft-koch-openpgp-webkey-service/?include_text=1>
gulp.task('openpgp-wkd',
	  shell.task('./pgp/update -v -d nats.io -k pgp/*.asc -o static'))

// // Watch
 gulp.task('watch', function() {
   gulp.watch('src/less/**/*.less', [ 'less' ]);
   gulp.watch('src/js/**/*.js', [ 'js' ]);
   gulp.watch('src/img/**/*', [ 'img' ]);
   gulp.watch('src/font/**/*', [ 'font' ]);
   gulp.watch('src/user_logos/**/*', [ 'userLogos' ]);
   gulp.watch('src/partner_logos/**/*', [ 'partnerLogos' ]);
   gulp.watch('src/company_logos/**/*', [ 'companyLogos' ]);
   gulp.watch('src/blog/**/*', [ 'blogImages' ]);
   gulp.watch('src/blog/**/*', [ 'blogImagesGifs' ]);
});

gulp.task('help', function(){
  console.log('if gulp build fails, simply add ".pipe(plumber())" to the task to see the error');
});

gulp.task('assets', [ 'less', 'css', 'js', 'img', 'font', 'docsImages', 'userLogos', 'partnerLogos', 'blogImages', 'blogImagesGifs', 'collateral', 'openpgp-wkd']);

// Default Task
// gulp.task('default', [ 'less', 'js', 'img', 'font', 'docsImages', 'userLogos', 'partnerLogos', 'blogImages', 'blogImagesGifs', 'watch' ]);

// Build for Production
gulp.task('build', function (callback) {
  runSequence( 'clean', 'assets', 'hugo', callback);
});
