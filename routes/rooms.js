var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
request.defaults({timeout: 6000});

//set Content type
router.use(function(req,res,next){
	res.header("Content-Type", "text/html");
	res.header("X-Frame-Options","DENY");
	next();
});
router.param('room_name', function(req,res, next, room_name){
	req.db.select().from('rooms').where({room_name: room_name}).limit(1).then(function(rows){
		if (rows.length == 0){
			var error = new Error("Room not found.");
			error.status = 404;
			throw error;
		}
		req.room = rows[0];
		next();
	}).catch(function(err){
		return next(err);
	});
});
router.get('/:room_name', function(req, res, next) {
	res.render('rooms/index', {
		title: 'InstaSync - '+req.room.room_name+"'s room!",
		room: req.room
	}, function(err,html){ //not sure this is needed
		if(err) {
			next(); //continues on to middleware as if this router was never called
		} else {
			res.end(html);
		}
	});
});


module.exports = router;
