var express = require('express');
var router = express.Router();

var staticReg = {
    script: /<script[^>]*?src=(["'])([^\1]*?)\1[^>]*?><\/script>/g,
    link: /<link[^>]*?href=(["'])([^\1]*?)\1[^>]*?\/?>/g
}

/* GET home page. */
router.get('*', function(req, res, next) {
    try {
        var path = req.originalUrl.slice(1).replace(/\.html^/, '');
        // var startTime = new Date().getTime();
        res.render(path, { title: 'Express' }, function(err, html) {
            var time = new Date().getTime();
            for (var i in staticReg) {
                html = html.replace(staticReg[i], function(all, $1, $2) {
                    var split = all.indexOf($2) + $2.length;
                    return all.substring(0, split) + '?v=' + time + all.substring(split);
                })
            }
            res.send(html);
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
