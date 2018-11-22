const gulp = require('gulp');
const rename = require("gulp-rename");
const postcss    = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps')
const gulpStylelint = require('gulp-stylelint');
const precss = require('precss');
const importPartial = require('postcss-partial-import');

const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const ratio = require('postcss-aspect-ratio');
const jorgeplugin = require('postcss-testing-plugin');

const defineProperty = require('postcss-define-property');

const plugins = [
    defineProperty(
        {
            syntax: {
                atrule: true,
                parameter: '',
                property: '-',
                separator: ''
            }
        }
    ),
    jorgeplugin,
    importPartial,
    precss,
    autoprefixer,
    ratio
];

const src = './src/**/*.pcss';

gulp.task('css', () => {
  
    return gulp.src('./src/styles/styles.pcss')
        .pipe( sourcemaps.init() )
        .pipe( postcss(plugins) )
        .pipe(gulpStylelint({
            failAfterError: false,
            reportOutputDir: 'reports/lint',
            reporters: [
                {formatter: 'verbose', console: true},
                {formatter: 'json', save: 'report.json'},
            ],
        }) )
        .pipe( rename({
            extname: ".css"
        }) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('./build/styles') )
        .pipe( browserSync.stream() );
});

gulp.task('reload', ['css'], function (done) {
    browserSync.init({
        server: './'
    });
    
    gulp.watch(src, ['css']);
    gulp.watch("./*.html").on('change', browserSync.reload);
})

gulp.task('watch', function() {
    gulp.watch(src, ['css']);
});

gulp.task('default', ['css', 'reload']);