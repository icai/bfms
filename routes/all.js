var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('*', function(req, res, next) {
  try{
	  var path = req.originalUrl.slice(1).replace(/\.html^/, '');
	  res.render(path , { title: 'Express' });
  }catch(e){
  	 next(e);
  }	
});

module.exports = router;