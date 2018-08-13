var gulp = require('gulp');
const postcss    = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps')
const precss = require('precss');
const autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync').create();

var fs = require('fs')
var cssstats = require('cssstats')

var css = fs.readFileSync('./src/styles/styles.css', 'utf8');

var cssstats = require('cssstats')
var stats = cssstats('./build/styles/styles.css');

gulp.task('css', () => {
  
    return gulp.src('./src/**/*.css')
      .pipe( sourcemaps.init() )
      .pipe( postcss([ precss, autoprefixer ]) )
      .pipe( sourcemaps.write('.') )
      .pipe( gulp.dest('./build/') )
      .pipe(browserSync.stream());
});

gulp.task('reload', ['css'], function (done) {
    browserSync.init({
        server: './'
    });
    
    gulp.watch('./src/**/*.css', ['css']);
    gulp.watch("./*.html").on('change', browserSync.reload);
} )

gulp.task('watch', function() {
    gulp.watch('./src/**/*.css', ['css']);
});

gulp.task('default', ['css', 'reload']);