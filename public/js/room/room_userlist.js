/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
function userlist(room, socket){
	var self = this;
	this.users = new Array();
	this.addUser = function(user, sort) {
		var css = '';
		css += user.loggedin ? "registered ":"";
		css += user.permissions > 0 ? "mod ":"";
		css += room.isMuted(user.ip) ? "muted" : "";
		user.css = css;
		self.users.push(user);
		var userElement = $('<li/>', {
			"class": css,
			"text":user.username,
			"data": {user: user}
		});
		$('#user_list').append(userElement);
		if (sort === true) {
			//sortUserlist();
		}
		$('.user-count').text(self.users.length);
	};
	this.removeUser = function(id) {
		for (var i = 0; i < self.users.length; i++)
		{
			if (id === self.users[i].id)
			{
				self.users.splice(i, 1);
				$($('#user_list').children('li')[i]).remove();
				break;
			}
		}
		$('.user-count').text(self.users.length);
	};
	this.load = function(userlist){
		$('#user_list').empty();
		self.users = new Array();
		for (var i = 0; i < userlist.length; i++) {
			self.addUser(userlist[i], false);
		}
		//sortUserlist();
	};
	function makeLeader(userId){
		$("#leaderSymbol").remove();
		for (var i = 0; i < users.length; i++)
		{
			if (users[i].id == userId)
			{
				var leaderElement = $("<img />", {
					"id":"leaderSymbol",
					"src":"/images/leader.png",
					"height":"16px",
					"width":"16px"
				});
				$($("#userlist li")[i]).prepend(leaderElement);
				break;
			}
		}
	}
	this.renameUser = function(id, username) {
		for (var i = 0; i < self.users.length; i++)
		{
			if (self.users[i].id == id)
			{
				self.users[i].username = username;
				$($('#user_list li')[i]).text(username);
				$($('#user_list li')[i]).data('user', self.users[i]);
				break;
			}
		}
		if (id == room.user.userinfo.id) {//this user renamed themself
			room.user.userinfo.username = username;
			$("#join").hide();
			$('#cin').show();
			$('#cin').removeAttr('disabled');
			$('#cin').focus();
		}
		//sortUserlist();
	};
	function sortUserlist() {
		var userlist = $('#userlist li')['clone'](true);
		userlist.sort(function (a, b) {
			var keyA = $(a).data('username').toLowerCase();
			var keyB = $(b).data('username').toLowerCase();
			if (keyA < keyB) {
				return -1;
			}
			if (keyA > keyB) {
				return 1;
			}
			return 0;
		});
		userlist.sort(function (a, b) {
			var keyA = $(a).data('css');
			var keyB = $(b).data('css');
			if (keyA > keyB) {
				return -1;
			}
			if (keyA < keyB) {
				return 1;
			}
			return 0;
		});
		$('#userlist').empty();
		$('#userlist').html(userlist);
		users.sort(function (a, b) {
			var keyA = a.username.toLowerCase();
			var keyB = b.username.toLowerCase();
			if (keyA < keyB) {
				return -1;
			}
			if (keyA > keyB) {
				return 1;
			}
			return 0;
		});
		users.sort(function (a, b) {
			var keyA = a.css;
			var keyB = b.css;
			if (keyA > keyB) {
				return -1;
			}
			if (keyA < keyB) {
				return 1;
			}
			return 0;
		});
	}
};