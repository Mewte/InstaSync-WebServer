var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
request.defaults({timeout: 6000});

var meta = {
	"index":{title:"Watch videos with friends!"},
	"help":{title:"Help"},
	"dmca":{title:"DMCA"},
	"privacy":{title:"Privacy Policy"},
	"settings":{title:"My Settings"},
	"terms":{title:"Terms of Service"}
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
	.bind({}).then(function(resp) {
		this.rooms = resp[0]; //first element of the array is an array of records I guess
		return req.db.select(req.db.raw("sum(users) as users, count(room_id) as rooms")).from("rooms").where("users",">", 0);
	}).then(function(online_count){
		console.log(online_count);
		res.render('pages/index', {
			title: 'InstaSync - '+meta['index'].title,
			rooms: this.rooms,
			numUsers: online_count[0].users,
			numRooms: online_count[0].rooms
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
		title: 'InstaSync - '+ (meta[req.param('page')] && meta[req.param('page')].title)
	}, function(err,html){
		if(err) {
			next(); //continues on to middleware as if this router was never called (should lead to 404)
		} else {
			res.end(html);
		}
	});
});

module.exports = router;
