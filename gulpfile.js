var gulp = require('gulp');
var clean = require('gulp-clean');
var htmlmin = require('gulp-htmlmin');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var overrideCssUrl = require('gulp-rev-css-url');
var sequence = require('gulp-sequence');
var zip = require('gulp-zip');

/**
 * options
 * @type {Object}
 */
var opt = {
    tmp: './tmp',
    assets: './public/**/*',
    build: './build'
}


String.prototype.repeat = function(n) {
    var n = n || 1;
    return Array(n + 1).join(this);
}


var getDate = function() {
    var date = new Date();
    var arr = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getMilliseconds()];
    for (var i = 0, len = arr.length; i < len; i++) {
        var sl = ("" + arr[i]).length;
        if(i == len - 1){
            if(sl < 3){
                arr[i] = "0".repeat( 3 - sl) + arr[i];
            }
        } else {
            if(sl == 1){
                arr[i] = "0" + arr[i];
            }
        }
    }
    return  "" + date.getFullYear() + arr.join('');
}

var serve = function() {
    var express = require('express');
    var app = express();
    var fs = require('fs');
    var publicdir = opt.build;
    app.use(function(req, res, next) {
        if (req.path.indexOf('.') === -1) {
            var file = publicdir + req.path + '.html';
            fs.exists(file, function(exists) {
                if (exists) {
                    var index = req.url.indexOf(req.path) + req.path.length
                    req.url = req.url.slice(0, index) + '.html' + req.url.slice(index);
                }
                next();
            });
        } else {
            next();
        }
    });
    app.use(express.static(publicdir));
    app.listen(3000, function() {
        console.log('build serve listening on port 3000!')
    })
}


// https://github.com/sindresorhus/gulp-rev

gulp.task('clean', function() {
    return gulp.src([opt.tmp, opt.build], { read: false })
        .pipe(clean());
})

gulp.task('clean:tmp', function() {
    return gulp.src([opt.tmp], { read: false })
        .pipe(clean());
})

gulp.task('compile', function() {
    'use strict';
    var twig = require('gulp-twig');
    var twigConfig = require('./config/twig');
    return gulp.src(['./views/**/*.html', '!./views/error.html', '!./views/layout.html'])
        .pipe(twig({
            extend: function(Twig) {
                twigConfig(Twig);
            },
            base: './views/',
            data: {
                title: 'Express'
            }
        }))
        .pipe(gulp.dest(opt.tmp));
});

gulp.task('assets', function() {
    return gulp.src(opt.assets)
        .pipe(gulp.dest(opt.tmp))
})



gulp.task("rev", function() {
    var jsFilter = filter(opt.tmp + "/**/*.js", { restore: true });
    var cssFilter = filter(opt.tmp + "/**/*.css", { restore: true });
    var htmlFilter = filter([opt.tmp + '/**/*', '!' + opt.tmp + '/**/*.html'], { restore: true });
    return gulp.src(opt.tmp + '/**/*.html')
        .pipe(useref({
            searchPath: opt.tmp,
        })) // Concatenate with gulp-useref
        .pipe(jsFilter)
        .pipe(uglify()) // Minify any javascript sources
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso()) // Minify any CSS sources
        .pipe(cssFilter.restore)
        .pipe(htmlFilter)
        .pipe(rev())
        .pipe(htmlFilter.restore)
        .pipe(revReplace()) // Substitute in new filenames
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(opt.tmp))
        .pipe(rev.manifest())
        .pipe(gulp.dest(opt.tmp));
});


gulp.task("revision", function() {
    return gulp.src([opt.tmp + "/**/*", '!' + opt.tmp + '/**/*.html'])
        .pipe(rev())
        .pipe(overrideCssUrl())
        .pipe(gulp.dest(opt.build))
        .pipe(rev.manifest())
        .pipe(gulp.dest(opt.build))
})

gulp.task("revreplace", ["revision"], function() {
    var manifest = gulp.src(opt.build + "/rev-manifest.json");
    return gulp.src(opt.tmp + "/**/*.html")
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest(opt.build));
});


gulp.task('build', sequence('clean', 'compile', 'assets', 'rev', 'revreplace', 'clean:tmp'))



/**
 * test build files
 * @param  {[type]} ) {               serve();} [description]
 * @return {[type]}   [description]
 */
gulp.task('serve', ['build'], function() {
    serve();
})



/**
 * package build files
 * @param  {[type]} ){} [description]
 * @return {[type]}       [description]
 */
gulp.task('zip', ['build'], function(){

    return gulp.src(opt.build +'/**/*')
        .pipe(zip('package-'+ getDate() +'.zip'))
        .pipe(gulp.dest('dist'))
})
