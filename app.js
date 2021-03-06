var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var twig = require('twig');
var twigConfig = require('./config/twig');

twig.extend(function(Twig) {
    twigConfig(Twig);
})


var all = require('./routes/all');

// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();


// app.set('view cache', false);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
twig.cache(false);
// use .html suffix as twig engine template file suffix
app.engine('html', twig.renderFile);
app.locals._layoutFile = 'layout.html';




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-dev-autoreload')({}));

// app.use('/', index);
// app.use('/users', users);

app.get('*', all);
// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
