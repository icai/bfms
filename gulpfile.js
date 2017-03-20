var gulp = require('gulp');
 
gulp.task('compile', function () {
    'use strict';
    var twig = require('gulp-twig');
    return gulp.src(['./views/**/*.html', '!./views/error.html', '!./views/layout.html'])
        .pipe(twig({
            data: {
                title: 'Express'
            }
        }))
        .pipe(gulp.dest('./release/'));
});





gulp.task('default', ['compile']);