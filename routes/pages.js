var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
request.defaults({timeout: 6000});

var pageTitles = {
	"index":"Watch videos with friends!",
	"help":"Help",
	"dmca":"DMCA",
	"privacy":"Privacy Policy",
	"settings":"My Settings"
};
//set Content type
router.use(function(req,res,next){
	res.header("Content-Type", "text/html");
	res.header("X-Frame-Options","DENY");
	next();
});
/* GET home page. */
router.get('/', function(req,res,next){
	indexRoute(req,res,next);
});
router.get('/pages/index', function(req, res, next) {
	indexRoute(req,res,next);
});
var room_list_cache = {rooms: [], cached: 0}; //repalces memcache for intensive front page query
function indexRoute(req,res,next){
	//WARNING: If you modify this for user allowed inputs: remember to sanitize it!
	req.db.raw("SELECT room.*, least(room.users, 30) * rand() as result FROM rooms as room where users > 0 and listing = 'public' and title <> 'No Videos' and (NSFW = 0 or NSFW = 1)order by result desc limit 24")
	.then(function(resp) {
		var records = resp[0]; //first element of the array is an array of records I guess
		res.render('pages/index', {
			title: 'InstaSync - '+pageTitles['index'],
			rooms: records
		}, function(err,html){
			if(err) {
				throw err;
			} else {
				res.end(html);
			}
		});
	}).catch(function(err){
		next(err);
	});	
}
router.get('/pages/:page', function(req, res, next) {
	res.render('pages/'+req.param('page'), {
		title: 'InstaSync - '+pageTitles[req.param('page')],
	}, function(err,html){
		if(err) {
			next(); //continues on to middleware as if this router was never called (should lead to 404)
		} else {
			res.end(html);
		}
	});
});

module.exports = router;
