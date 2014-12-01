/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
var request = new function(){
	var base_url = "/ajax/";
	this.register = function(credentials, callback){
		$.post(base_url+"register", credentials).done(function(response){
			callback(false,response);
		}).fail(function(err){
			if (err.status == 0){
				err.responseJSON = {message: "Failed to connect to server. Try again later."}
			}
			callback(err);
		});
	};
	this.login = function(credentials, callback)
	{
		$.post(base_url+"login", credentials).done(function(response){
			callback(false,response);
		}).fail(function(err){
			if (err.status == 0){
				err.responseJSON = {message: "Failed to connect to server. Try again later."}
			}
			callback(err);
		});
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
		}).fail(function(){
			callback(false);
		});
	};
	function getRoomInfo(room, callback)
	{
		$.get("/ajax/roominfo?room=" + room).done(function(data)
		{
			var result = JSON.parse(data);
			callback(result.listing, result.description, result.info, result.error);
		});
	}
	function getUserInfo(username, callback)
	{
		$.get("/ajax/userinfo?username=" + username).done(function(data)
		{
			var result = JSON.parse(data);
			callback(result.avatar, result.bio, result.error);
		});
	}
	function setUserInfo(avatar, bio, social, callback)
	{
		$.post("/ajax/userinfo", {avatar: avatar, bio: bio, social: social}).done(function(data)
		{
			var result = JSON.parse(data);
			callback(result.error);
		});
	}
};