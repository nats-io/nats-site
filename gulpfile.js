var gulp =          require('gulp'),
    debug =         require('gulp-debug'),
    notify =        require('gulp-notify'),
    concat =        require('gulp-concat'),
    rename =        require('gulp-rename'),
    watch =         require('gulp-watch'),
    less =          require('gulp-less'),
    gm =            require('gulp-gm'),
    autoprefixer =  require('gulp-autoprefixer'),
    sourcemaps =    require('gulp-sourcemaps');

// Resize User Logos
gulp.task('userLogos', function() {
  return gulp.src('src/user_logos/**/*')
        .pipe(gm(function (gmfile) {
          return gmfile.resize(100, 100);
        }))
        .pipe(gulp.dest('static/img/user_logos'))
        .pipe(notify({ message: 'Finished resizing image'}));
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
  gulp.watch('src/img/**/*', ['img']);
});

// Default Task
gulp.task('default', ['userLogos','img','watch']);
