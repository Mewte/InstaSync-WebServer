var commands = {
"'ban": function (data) {
	var banUserID = null;
	for (var i = 0; i < users['length']; i++) {
		if (users[i].username.toLowerCase() === data[1].toLowerCase()) {
			banUserID = users[i].id;
		}
	}
   room.sendcmd('ban', {userid: banUserID});
},
"'unban": function (data) {
   room.sendcmd('unban', {username: data[1]});
},
"'clearbans": function (data) {
   room.sendcmd('clearbans', null);
},
"'kick": function (data) {
	var kickUserID = null;
	for (var i = 0; i < users['length']; i++) {
		if (users[i]['username']['toLowerCase']() === data[1]['toLowerCase']()) {
			kickUserID = users[i]['id'];
		}
	}
   room.sendcmd('kick', {userid: kickUserID});
},
"'next": function (data) {
   room.sendcmd('next', null);
},
"'remove": function (data) {
	if (!isNaN(data[1])) {
	   room.sendcmd('remove', {info: playlist[data[1]].info});
	}
},
"'purge": function (data) {
   room.sendcmd('purge', {username: data[1]});
},
"'play": function (data) {
	if (!isNaN(data[1])) {
	   room.sendcmd('play', {
			info: playlist[data[1]].info
		});
	}
},
"'pause": function (data) {
   room.sendcmd('pause', null);
},
"'resume": function (data) {
   room.sendcmd('resume', null);
},
"'seekto": function (data) {
	if (!isNaN(data[1])) {
	   room.sendcmd('seekto', {time: data[1]});
	}
},
"'seekfrom": function (data) {
	if (!isNaN(data[1])) {
	   room.sendcmd('seekfrom', {time: data[1]});
	}
},
"'setskip": function (data) {
	if (!isNaN(data[1])) {
	   room.sendcmd('setskip', {skip: data[1]});
	}
},
"'resynch": function (data) {
   room.sendcmd('resynch', null);
},
"'motd": function (data) {
	data.splice(0, 1);
   room.sendcmd('motd', {MOTD: data.join(' ')});
},
"'mod": function (data) {
   room.sendcmd('mod', {username: data[1]});
},
"'demod": function (data) {
   room.sendcmd('demod', {username: data[1]});
},
"'banlist": function (data) {
   room.sendcmd('banlist', null);
},
"'modlist": function (data) {
   room.sendcmd('modlist', null);
},
"'description": function (data) {
	data['splice'](0, 1);
   room.sendcmd('description', {description: data['join'](' ')});
},
"'move": function (data) {
	if (!isNaN(data[1]) && !isNaN(data[2])) {
	   room.sendcmd('move', {info: playlist[data[1]].info,position: data[2]});
	}
},
"'clean": function (data) {
   room.sendcmd('clean', null);
},
"'togglefilter": function (data) {
	filterGreyname = !filterGreyname;
},
"'save": function (data) {
   room.sendcmd("save", null);
},
"'toggleautosynch": function (data) {
	toggleAutosynch();
},
"'leaverban": function (data) {
   room.sendcmd("leaverban", {username: data[1]});
},
"'lead": function (data) {
   room.sendcmd("lead", null);
},
"'unlead": function (data) {
   room.sendcmd("unlead", null);
}
};