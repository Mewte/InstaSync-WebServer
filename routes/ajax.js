var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var validator = require('validator');
var crypto = require('crypto');
var moment = require('moment');
//router.use(function(req,res,next){ //testing only
//	res.set('Access-Control-Allow-Origin',req.headers.origin || req.host);
//	res.set('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS');
//	res.set('Access-Control-Allow-Headers', "Content-Type");
//	res.set('Access-Control-Allow-Credentials', "true");
//	next();
//});
router.use(function (req, res, next) {
	res.set('Content-Type', 'application/json');
	if (req.headers.origin != undefined){  //check origin i.e. cross domain (the browser sends an origin if it's a cross domain request, which we are blocking)
		var error = new Error("Cross Origin Resource Sharing is not enabled.");
		error.status = 403;
		return next(error);
	}
	else{ //check if user is logged in and set a user object (code reuse is good right?)
		if (!(req.cookies.auth_token && req.cookies.username)){
			req.user = undefined;
			return next();
		}
		else{
			var auth_token = req.cookies.auth_token;
			var username = req.cookies.username;
			req.db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({cookie: auth_token, username: username}).limit(1).then(function(rows){
				if (rows.length == 0){
					req.user = undefined;
				}
				else{
					req.user = rows[0];
				}
				return next();
			}).catch(function(err){
				return next(err);
			});
		}
	}
});
;
router.post('/login', function(req,res,next){
	if (!(req.body.username && req.body.password)){
		var error = new Error("Username and password are both required.");
		error.status = 422;
		return next(error);
	}
	var username = req.body.username;
	var password = crypto.createHash('sha1').update(req.body.password).digest('hex');
	//Note for below: .bind({}) forces 'this' to be shared among each promise resolution. Handy for passing data between promises
	req.db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({username:username, hashpw: password}).limit(1).bind({}).then(function(rows){
		if (rows.length == 0){
			var error = new Error("Invalid username or password.");
			error.status = 403;
			throw error;
		}
		else{ //success
			this.user = rows[0];
			this.username = username; //pass the exact case username user supplied
			this.auth_token = crypto.pseudoRandomBytes(20).toString('hex');
			return req.db('users').update({cookie: this.auth_token, last_login: moment().format("YYYY-MM-DD HH:mm:ss")}).where({id: this.user.user_id});
		}
	}).then(function(){
		res.cookie('auth_token', this.auth_token, {expires: new Date(Date.now() + 60*60*24*7*1000)}); //1000 for milliseconds
		res.cookie('username', this.username, {expires: new Date(Date.now() + 60*60*24*7*1000)}); //1000 for milliseconds
		res.json(this.user);
	}).catch(function(err){
		 return next(err);
	});
});
router.post('/logout', function(req,res,next){
	res.cookie('auth_token', "", {expires: new Date(Date.now() - 60*60*24*7*1000)}); //1000 for milliseconds
	res.cookie('username', "", {expires: new Date(Date.now() - 60*60*24*7*1000)}); //1000 for milliseconds
	res.send("");
});
//Todo: turn validation into a seperate function
router.post('/register', function(req,res,next){
	//check if empty
	if (!req.body.username){
		var error = new Error("Username cannot be empty.");
		error.status = 422;
		error.field_name = "username";
		return next(error);
	}
	else if(!req.body.password){
		var error = new Error("Password cannot be empty.");
		error.status = 422;
		error.field_name = "password";
		return next(error);
	}
	else if(!req.body.email){
		var error = new Error("Email address required.");
		error.status = 422;
		error.field = "email";
		return next(error);
	}
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	//validate properties
    if(username.match(/^([A-Za-z0-9]|([-_](?![-_]))){3,16}$/) == null){
        var error = new Error("Usernames must be 3-16 characters, A-Z, 1-9, and may include non-repeating hyphens( - ) and underscores( _ ).");
		error.status = 422;
		error.field_name = "username";
        return next(error);
    }
    if(validator.isNumeric(username)){
        var error = new Error("Username must contain at least 1 alpha character.");
		error.status = 422;
		error.field_name = "username";
        return next(error);
    }
	if (password.length < 6){
        var error = new Error("Password must be at least 6 characters.");
		error.status = 422;
		error.field_name = "password";
        return next(error);
	}
	if (!validator.isEmail(email)){
        var error = new Error("Email must be in a valid email address.");
		error.status = 422;
		error.field_name = "email";
        return next(error);
	}
	//so much validation, yay now we can actually do the registration portions..
	password = crypto.createHash('sha1').update(password).digest('hex');
	var auth_token = crypto.pseudoRandomBytes(20).toString('hex');
	req.db('users').insert({username: username, hashpw: password, email: email, cookie: auth_token, last_login: moment().format("YYYY-MM-DD HH:mm:ss"), registered_ip: req.cf_ip}).bind({}).then(function(inserted_ids){
		this.user_id = inserted_ids[0];
		return req.db('rooms').insert({room_id: this.user_id, room_name: username});
	}).then(function(){
		res.cookie('auth_token', auth_token, {expires: new Date(Date.now() + 60*60*24*7*1000)}); //1000 for milliseconds
		res.cookie('username', username, {expires: new Date(Date.now() + 60*60*24*7*1000)}); //1000 for milliseconds
		res.json({username: username, user_id: this.user_id});
	}).catch(function(err){
		//fix this
		if (err.code == "ER_DUP_ENTRY"){
			var error = new Error("That username is already registered.");
			error.status = 422;
			error.field_name = "username";
			return next(error);
		}
		return next(err);
	});
});
router.get('/me/user_info', function(req,res,next){
	if (!req.user){
		var error = new Error("You must be logged in to view this resource.");
		error.status = 403;
		return next(error);
	}
	else
		res.json(req.user);
});
router.post('/me/change_password', function(req,res,next){

});
router.post('/me/password_reset', function(req,res,next){

});
router.post('/me/room_info', function(req,res,next){

});
router.post('/me/user_info', function(req,res,next){

});
router.get('/user/:username', function(req,res,next){
	var username = req.param('username');
	req.db.select(['username','avatar','bio']).from('users').where({username:username}).limit(1)
	.then(function(rows){
		if (rows.length == 0){
			var error = new Error("User not found.");
			error.status = 404;
			throw error;
		}
		res.json(rows[0]);
	}).catch(function(err){
		return next(err);
	});
});
router.get('/room/:room_name', function(req,res,next){
	var room_name = req.param('room_name');
	req.db.select().from('rooms').where({room_name:room_name}).limit(1).then(function(rows){
		if (rows.length == 0){
			var error = new Error("Room not found.");
			error.status = 404;
			throw error;
		}
		res.json(rows[0]);
	}).catch(function(err){
		return next(err);
	});
});
router.get('/mods/:room_name', function(req,res,next){
	var user = req.user;
	var room = req.param("room_name");
	if (!req.user){
		var error = new Error("You must be logged in to view this resource.");
		error.status = 403;
		return next(error);
	}
	if (user.username.toLowerCase() == room.toLowerCase()){ //room owner
		req.db.select(["users.id as user_id","users.username","users.avatar","users.bio"])
				.from('users').join('mods','mods.username','users.username')
				.where("mods.room_name",room)
		.then(function(rows){
			res.json(rows);
		}).catch(function(err){
			return next(err);
		});
	}
	else{ //everyone else
		req.db.select().from('mods').where("mods.room_name",room).where("mods.username",user.username).limit(1)
		.then(function(mod){
			if (mod.length == 0){ //not a mod of this room, so deny this resource
				var error = new Error("This resource is for moderators only.");
				error.status = 403;
				throw error;
			}
			return req.db.select(["users.id as user_id","users.username","users.avatar","users.bio"])
			.from('users').join('mods','mods.username','users.username')
			.where("mods.room_name",room);
		})
		.then(function(mods){
			res.json(mods);
		})
		.catch(function(err){
			return next(err);
		});
	}
});
router.post('/mods/add', function(req,res,next){

});
router.post('/mods/remove', function(req,res,next){

});
router.get('/capcha', function(req,res,next){

});
router.use(function (req, res, next) {
	var error = new Error("Resource or method not found.");
	error.status = 404;
	next(error);
});
/*
 * This gets called if no route matches, use this for JSON 404 (instead of the default error handler in app.js
 */
router.use(function (err, req, res, next) {
//err.status = err.status || 500; //insure status property is set, or 500
	var error = jsonFriendlyError(err);
	error.status = err.status || 500;
	error.stack = undefined;
	//error.stack = undefined; //Dont show stack trace, we could for dev, but I'd rather just disable it completely
	if (error.status == 500){
		res.status(500).json({message:"The server encountered an error and was forced to abort the request. Please try again later.", status: 500});
		console.log(err);
		//Todo: Log errors to a database and then return the error_id to the user for reporting
	}
	else
		res.status(error.status).json(error);
	//console.log(error);
});
//Takes a node.js 'error' object and makes it JSONable
//(Trying to JSON an Error object usually results in properties missing.)
//http://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify#answer-20405830
function jsonFriendlyError(err, filter, space) {
	var plainObject = {};
	Object.getOwnPropertyNames(err).forEach(function (key) {
		plainObject[key] = err[key];
	});
	return plainObject;
}
;
module.exports = router;