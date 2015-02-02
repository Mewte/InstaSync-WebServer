/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
//Use this to have the socket in a file seperate from the room file, but it's still a part of it (or rather an extension of it)
room.setSocket(new function (room){
	var server = "";
	if (location.protocol.toLowerCase() == "https:"){
		server = SECURE_CHAT_SERVER;
	}
	else{
		server = CHAT_SERVER;
	}
	var socket = io.connect(server,
	{
		query: "room="+room.roomName,
		reconnect: true,
		"force new connection": true,
		"try multiple transports": true,
		"reconnection delay": 1000,
		"max reconnection attempts": 4,
		"auto connect": false,
		"connect timeout": 5000,
		"sync disconnect on unload": true,
		transports: ['xhr-polling'] //testing
		//transports: ['websocket','xhr-polling'] //testing
	});
	var commandList = new commands(this,room);
	this.sendmsg = function (message) {
		var d = new Date();
		message = message.substring(0, 240);
		if (message[0] == "'")
		{
			var arguments = message['split'](' ');
			if (commandList.list[arguments[0].toLowerCase()] != undefined) {
				commandList.list[arguments[0].toLowerCase()](arguments);
			}
		}
		else
		{
			socket.emit('message', {message: message});
		}
	};
	this.sendcmd = function (command, data) {
		if (data == undefined){
			data = null;
		}
		socket.emit('command', {command: command, data: data});
	};
	this.rename = function (username) {
		socket.emit('rename', {username: username});
	};
	this.disconnect = function () {
		socket.disconnect();
	};
	this.connect = function () {
		socket.socket.connect();
	};
	function attemptFailover(){
		room.addMessage({username:""},"Attempting failover..","text-danger");
		socket.socket.options.host = FAIL_OVER; //located in room/index.ejs
		socket.socket.transports = ['xhr-polling'];
		socket.socket.origTransports = ['xhr-polling']; //Because I'm lying to you Socket.io, baby girl, let's pretend you were xhr-polling the entire time ;)
		socket.socket.reconnect();
	};
	socket.on('sys-message', function (data) {
		room.addMessage({username: ""}, data.message, 'text-info');
	});
	socket.on('rename', function (data) {
		room.userlist.renameUser(data.id, data.username);
	});
	socket.on('connecting', function () {
		room.onConnecting();
	});
	socket.on('connect', function () {
		if ($['cookie']('username') === undefined || $['cookie']('auth_token') === undefined)
		{
			socket.emit('join', { username: '', cookie: '', room: room.roomName});
		}
		else
		{
			socket.emit('join', {username: $['cookie']('username'),cookie: $['cookie']('auth_token'), room: room.roomName});
		}
		room.onConnected();
		room.onJoining();
	});
	socket.on('reconnecting', function (delay,attempt) {
		console.log("Attempt: "+attempt);
		if (attempt > 3 && socket.socket.options.host != FAIL_OVER){
			attemptFailover();
		}
		else{
			room.onReconnecting(attempt);
		}
	});
	socket.on('reconnect', function (data) {
		room.onReconnect();
	});
	socket.on('connect_failed', function(){
		//console.log("CONNECT FAILED");
	});
	socket.on('reconnect_failed', function () {
		room.onReconnectFailed();
	});
	socket.on('request-disconnect', function()
	{
		socket.disconnect();
	});
	socket.on('disconnect', function (data){
		room.onDisconnect();
	});
	socket.on('error', function(){
		console.log("error");
		if (socket.socket.options.host != FAIL_OVER){
			attemptFailover();
		}else{
			room.onError();
		}
	});
	socket.on('userinfo', function (data) {
		room.onJoined();
		room.userinfo(data);
	});
	socket.on('playlist', function (data) {
		room.playlist.load(data.playlist);
	});
	socket.on('userlist', function (data) {
		room.userlist.load(data.userlist);
	});
	socket.on('room-event', function (data)
	{
		//TODO: data.data should ALWAYS BE DATA, why is it sometimes data.data and sometimes data.poll? etc.
		room.event(data.action, data);
	});
	socket.on('add-user', function (data)
	{
		room.userlist.addUser(data.user);
	});
	socket.on('remove-user', function (data)
	{
		room.userlist.removeUser(data['userId']);
	});
	socket.on('chat', function (data)
	{
		room.addMessage(data.user, data.message, '');
	});
	socket.on('add-vid', function (data) {
		room.playlist.addVideo(data.info);
	});
	socket.on('remove-vid', function (data) {
		for(var i = 0; i < data.videos.length; i++){
			room.playlist.removeVideo(data.videos[i]);
		}
	});
	socket.on('move-vid', function (data) {
		room.playlist.moveVideo(data.info, data.position);
	});
	socket.on('play', function (data) {
		room.playVideo(data.info, data.time, data.playing);
	});
	socket.on('resume', function (data) {
		room.resume();
	});
	socket.on('pause', function (data) {
		room.pause();
	});
	socket.on('seekTo', function (data) {
		room.seekTo(data.time);
	});
	socket.on('skips', function (data) {
		room.setSkips(data.skips, data.skipsneeded);
	});
	socket.on('purge', function (data) {
		room.playlist.purge(data.username);
	});
	socket.on('log', function (data) {
		console.log(data.message);
	});
	return this;
}(room));