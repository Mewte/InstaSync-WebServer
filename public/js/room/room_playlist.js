/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/

function playlist(room, socket){
	var self = this;
	this.videos = new Array();
	this.totalTime = 0;
	this.videos.move = function (old_index, new_index){ //Code is property of Reid from stackoverflow
		if (new_index >= this.length) {
			var k = new_index - this.length;
			while ((k--) + 1) {
				this.push(undefined);
			}
		}
		this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	};
	/*
	 * TODO: Improve this as it emptys the list and rebuilds it everytime
	 */
	this.moveVideo = function(vidinfo, position) {
		var indexOfVid = self.indexOf(vidinfo);
		if (indexOfVid > -1) {
			self.videos.move(indexOfVid, position);
			var playlistElements = $('#playlist li').clone(true);
			playlistElements.move = function (old_index, new_index) {
				if (new_index >= this.length) {
					var k = new_index - this.length;
					while ((k--) + 1) {
						this.push(undefined);
					}
				}
				this.splice(new_index, 0, this.splice(old_index, 1)[0]);
			};
			playlistElements.move(indexOfVid, position);
			$('#playlist').empty();
			$('#playlist').html(playlistElements);
		}
	};
	this.addVideo = function(video) {
		self.videos.push(video);
		var li = $('<li/>', {"data":{video:video}});
			li.append($('<div/>', {
				class:"title",
				title:video.title,
				text:video.title
			}));
			li.append($("<div/>", {
				class:"buttons"
				}).append(
					$("<a/>",{target: "_blank", href: url(video)}).append($("<i/>",{class:"fa fa-external-link"}))
				)
				.append($("<i/>",{
					class:"fa fa-times-circle"
				})));
			li.append($("<div/>",{
				class:"pl-video-info"
				}).append($("<div/>",{
					class:"addedby",
					html:$("<a/>",{href:"",title:"Added by "+video.addedby,text:"-"+video.addedby})
				})).append($("<div/>",{
					class:"duration",
					text:utils.secondsToTime(video.duration)
				})));
		$('#playlist').append(li);
		self.totalTime += video.duration;
		$('#playlist_count').text(self.videos.length + " Videos");
		$('#playlist_duration').text(utils.secondsToTime(self.totalTime));
	};
	this.removeVideo = function(video) {
		var indexOfVid = self.indexOf(video);
		if (indexOfVid > -1 && indexOfVid < self.videos.length) {
			self.totalTime -= self.videos[indexOfVid].duration;
			self.videos.splice(indexOfVid, 1);
			$($('#playlist').children('li')[indexOfVid]).remove();
		}
		$('#playlist_count').text(self.videos.length + " Videos");
		$('#playlist_duration').text(utils.secondsToTime(self.totalTime));
	};
	this.indexOf = function(vidinfo) {
		for (var i = 0; i < self.videos.length; i++) {
			if (JSON['stringify'](self.videos[i]['info']) === JSON['stringify'](vidinfo)) {
				return i;
			}
		}
		return -1;
	};
	this.load = function(data) {
		self.videos = new Array();
		self.videos.move = function (old_index, new_index) //Code is property of Reid from stackoverflow
		{
			if (new_index >= this.length) {
				var k = new_index - this.length;
				while ((k--) + 1) {
					this.push(undefined);
				}
			}
			this.splice(new_index, 0, this.splice(old_index, 1)[0]);
		};
		self.totalTime = 0;
		$('#playlist').empty();
		if (data != undefined && data.length != 0) {
			for (var i = 0; i < data.length; i++) {
				self.addVideo(data[i]);
			}
		}
	};
	this.purge = function(username) {
		for (var i = self.videos.length - 1; i >= 0; i--)
		{
			if (self.videos[i].addedby.toLowerCase() == username.toLowerCase()) {
				self.removeVideo(self.videos[i].info);
			}
		}
	};
	function url(vidinfo){
			if (vidinfo.info.provider === 'youtube') {
				return 'http://www.youtube.com/watch?v=' + vidinfo.info.id;
			}
			else if (vidinfo.info.provider === 'vimeo') {
				return'http://vimeo.com/' + vidinfo.info.id;
			}
			else if (vidinfo.info.provider === 'twitch') {
				if (vidinfo.info.mediaType === "stream")
					return 'http://twitch.tv/' + vidinfo.info.channel;
			}
			else if (vidinfo.info.provider === 'dailymotion'){
				return "http://dailymotion.com/video/"+vidinfo.info.id;
			}
			else{
				return "http://instasync.com";
			}
	}
	return this;
};