var gulp =          require('gulp'),
    debug =         require('gulp-debug'),
    notify =        require('gulp-notify'),
    concat =        require('gulp-concat'),
    rename =        require('gulp-rename'),
    watch =         require('gulp-watch'),
    less =          require('gulp-less'),
    gm =            require('gulp-gm'),
    imageResize =   require('gulp-image-resize'),
    gulpif =        require('gulp-if'),
    autoprefixer =  require('gulp-autoprefixer'),
    sourcemaps =    require('gulp-sourcemaps');

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

// Resize Blog Images
gulp.task('blogImages', function() {
  return gulp.src('src/blog/**/*.{png,jpg,jpeg}')
        .pipe(imageResize({
          width : 800
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

// Images
gulp.task('img', ['userLogos'], function() {
  return gulp.src('src/img/**/*')
        .pipe(gulp.dest('static/img'))
        .pipe(notify({ message: 'Finished copying image'}));
});

// Watch
gulp.task('watch', function() {
  gulp.watch('src/user_logos/**/*', ['userLogos']);
  gulp.watch('src/partner_logos/**/*', ['partnerLogos']);
  gulp.watch('src/blog/**/*', ['blogImages']);
  gulp.watch('src/blog/**/*', ['blogImagesGifs']);
  gulp.watch('src/img/**/*', ['img']);
});

// Default Task
gulp.task('default', ['userLogos', 'partnerLogos', 'blogImages', 'blogImagesGifs', 'img', 'watch']);
