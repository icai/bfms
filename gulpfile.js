var gulp = require('gulp');

gulp.task('compile', function() {
    'use strict';
    var twig = require('gulp-twig');
    var twigConfig = require('./config/twig');
    return gulp.src(['./views/**/*.html', '!./views/error.html', '!./views/layout.html'])
        .pipe(twig({
            extend: function(Twig) {
                twigConfig(Twig);
            },
            data: {
                title: 'Express'
            }
        }))
        .pipe(gulp.dest('./release/'));
});



gulp.task('default', ['compile']);
