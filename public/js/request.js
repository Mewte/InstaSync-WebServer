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
	this.getRoomInfo = function(callback){
		$.get(base_url+"me/room_info").done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.getMods = function(room,callback){
		//todo: if room != null, find mods for that room, else mods for users own room
		$.get(base_url+"me/mods").done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.addMod = function(username,callback){
		$.post(base_url+"mods/add",{username: username}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.removeMod = function(username,callback){
		$.post(base_url+"mods/remove",{username: username}).done(function(response){
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
	this.getUser = function(username, callback)
	{
		$.get(base_url+"user/"+username).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.updateUser = function(avatar, bio, callback)
	{
		$.post("/ajax/me/user_info", {avatar: avatar, bio: bio}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.updateRoom = function(listing, description, info, callback)
	{
		$.post("/ajax/me/room_info", {listing: listing, description: description, info: info}).done(function(response){
			callback(false,response);
		}).fail(errorHandler(callback));
	};
	this.getYoutubeSearch = function(parameters, callback){
		var url = "http://gdata.youtube.com/feeds/api/videos?alt=json&v=2&q="
					+encodeURIComponent(parameters.query)
					+"&start-index="+parameters.startIndex
					+"&max-results="+parameters.maxResults
					+"&fields=entry(title,author,yt:statistics,yt:rating,media:group(yt:duration,yt:videoid))";
		$.get(url).done(function(data){
			callback(true, data.feed.entry);
		}).fail(function(){
			callback(false);
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