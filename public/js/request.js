/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
var request = new function(){
	var base_url = "/ajax/";
	this.register = function(credentials, callback){
		$.post(base_url+"register", credentials).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.login = function(credentials, callback)
	{
		$.post(base_url+"login", credentials).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.logout = function(callback){
		$.post(base_url+"logout").done(function(){
			callback();
		}).fail(function(){
			callback();
		});		
	};
	this.checklogin = function(callback){
		$.get(base_url+"me/user_info").done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.changePassword = function(current,newPass,callback){
		$.post(base_url+"me/change_password",{current: current, new: newPass}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.sendReset = function(username, email, callback){
		$.post(base_url+"me/send_reset",{username: username, email: email}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.passwordReset = function(token,newPass,callback){
		$.post(base_url+"me/password_reset",{token: token, new: newPass}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	function getRoomInfo(room, callback)
	{
		$.get("/ajax/roominfo?room=" + room).done(function(data)
		{
			var result = JSON.parse(data);
			callback(result.listing, result.description, result.info, result.error);
		});
	}
	this.getUser = function(username, callback)
	{
		$.get(base_url+"user/"+username).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	}
	function setUserInfo(avatar, bio, social, callback)
	{
		$.post("/ajax/userinfo", {avatar: avatar, bio: bio, social: social}).done(function(data)
		{
			var result = JSON.parse(data);
			callback(result.error);
		});
	}
	function errorHandler(callback){
		return function(err){
			if (err.status == 0){
				err.responseJSON = {message: "Failed to connect to server. Try again later."}
			}
			callback(err);
		};
	}
};