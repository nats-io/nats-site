var gulp         = require('gulp'),
    gm           = require('gulp-gm'),
    imageResize  = require('gulp-image-resize'),
    clean        = require('gulp-clean');

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

// Resize Blog Images
gulp.task('blogImages', function() {
  return gulp.src('src/blog/**/*.{png,jpg,jpeg}')
    .pipe(imageResize({
      width : 900
    }))
    .pipe(gulp.dest('static/img/blog'));
});

gulp.task('help', function(){
  console.log('if gulp build fails, simply add ".pipe(plumber())" to the task to see the error');
});

gulp.task('assets', ['userLogos', 'partnerLogos', 'blogImages']);
