var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var crypto = require('crypto');
var moment = require('moment');
var helpers = require('../helpers');
var queries = helpers.queries;
var promise = require("bluebird");

router.use(function (req, res, next) {
	res.set('Content-Type', 'application/json');
	var origin = req.headers.origin;
	var host = req.headers.host;
	//if origin is undefined, not cross domain (firefox only), for chrome + safari: make sure host and origin don't equal eachother
	//Note: host only contains domain and port, origin contains http/https
	if (origin != undefined && origin != "http://"+host && origin != "https://"+host){  //check origin i.e. cross domain (the browser sends an origin if it's a cross domain request, which we are blocking)
		var error = new Error("Cross Origin Resource Sharing is not enabled.");
		error.status = 403;
		return next(error);
	}
	else{ //check if user is logged in and set a user object (code reuse is good right?)
		if (!(req.cookies.auth_token && req.cookies.username)){
			var error = new Error("You must be logged in to view this resource.");
			error.status = 403;
			return next(error);
		}
		else{
			queries.getLoggedInUser(req.cookies.auth_token,req.cookies.username).then(function(user){
				if (!user){
					var error = new Error("You must be logged in to view this resource.");
					error.status = 403;
					return next(error);
				}
				else{
					req.user = user;
					return next();
				}
			}).catch(function(err){
				return next(err);
			});
		}
	}
});
router.post("/send_message/:user_id",function(req,res,next){
	var userA = Math.min(req.params("user_id"), req.user.user_id);
	var userB = Math.max(req.params("user_id"), req.user.user_id);
	req.db.select("*").from("friends_list").where({userA:userA,userB:userB}).then(function(friend){ //check if users are friends
		if (friend.length == 0){
			var error = new Error("You are not friends with this user.");
			error.status = 403;
			throw error;
		}
		return req.db("friends_messages").insert({userA:userA,userB:userB,message:req.body.message,sentBy:req.user.user_id});
	}).then(function(inserted_id){
		res.send(inserted_id);
	}).catch(function(err){
		return next(err);
	});
});
router.post("/send_friend_request/:username",function(req,res,next){
	req.db.select(["username"],"id").from("users").where({username:req.param("username")}).then(function(user){
		if (user.length == 0){
			var error = new Error("Username not found.");
			error.status = 404;
			throw error;
		}
		if (user[0].id == req.user.user_id){
			var error = new Error("You can't send a friend request to yourself.");
			error.status = 400;
			throw error;
		}
		var userA = Math.min(user[0].id, req.user.user_id);
		var userB = Math.max(user[0].id, req.user.user_id);
		var sentBy = req.user.user_id;
		return req.db("friend_requests").insert({userA:userA,userB:userB,sentBy:sentBy});
	}).then(function(){
		res.json({"success":true});
	}).catch(function(err){
		//check for duplicate error here
		return next(err);
	});
});
router.post("/accept_friend/:user_id",function(req,res,next){
	var userA = Math.min(req.params("user_id"), req.user.user_id);
	var userB = Math.max(req.params("user_id"), req.user.user_id);
	var sentBy = req.params("user_id");
	req.db("friend_requests").where({userA:userA,userB:userB,sentBy:sentBy}).del().then(function(affected){
		if (affected == 0){
			var error = new Error("No friend request from this user found.");
			error.status = 404;
			throw error;
		}
		return req.db("friends_list").insert({userA:userA,userB:userB,sentBy:sentBy});
	}).then(function(){
		res.json({"success":true});
	}).catch(function(err){
		return next(err);
	});
});
router.post("/remove_friend/:user_id",function(req,res,next){
	var userA = Math.min(req.params("user_id"), req.user.user_id);
	var userB = Math.max(req.params("user_id"), req.user.user_id);
	req.db("friends_list").where({userA:userA,userB:userB}).del().then(function(affected){
		if (affected == 0){
			var error = new Error("Friend not found.");
			error.status = 404;
			throw error;
		}
		return req.db("friends_list").insert({userA:userA,userB:userB});
	}).then(function(){
		res.json({"success":true});
	}).catch(function(err){
		return next(err);
	});
});
router.post("/mark_read/:message_id",function(req,res,next){

});
router.get("/conversation/:user_id",function(req,res,next){

});
router.get("/friends_list",function(req,res,next){
	req.db.select(["id","username"]).from(req.db.union(function(){
		this.select("userA as friend_id").from("friends_list").where({userB:req.user.user_id});
	}).union(function(){
		this.select("userB as friend_id").from("friends_list").where({userA:req.user.user_id});
	}).as("a")).join('users','users.id','=','a.friend_id').then(function(friends){
		res.json(friends);
	}).catch(function(err){
		return next(err);
	});
});
router.get("/friend_requests",function(req,res,next){
	req.db.select(["id","username","sentBy"]).from(req.db.union(function(){
		this.select(["userA as friend_id", "sentBy"]).from("friend_requests").where({userB:req.user.user_id});
	}).union(function(){
		this.select(["userB as friend_id","sentBy"]).from("friend_requests").where({userA:req.user.user_id});
	}).as("a")).join('users','users.id','=','a.friend_id').then(function(requests){
		res.json(requests);
	}).catch(function(err){
		return next(err);
	});
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
		console.log(err.stack);
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