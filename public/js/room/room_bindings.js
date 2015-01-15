/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
function onReady(room, socket){
	$('#addUrl').click(function () {
		var url = $('#URLinput').val();
		if ($('#URLinput').val().trim() != '')
		{
			room.sendcmd('add', {URL: url});
		}
		$('#URLinput').val('');
	});
	$('#cin')['focus'](function () {
		room.unreadMessages = 0;
		document.title = 'InstaSync - '+ room.roomName + "'s room";
	});
	$("#tabs_chat").click(function(){
		room.unreadTabMessages = 0;
		$("#tabs_chat .unread-msg-count").text("");
	});
	//(C) BibbyTube, (C) Faqqq
	//https://github.com/Bibbytube/Instasynch/blob/master/Chat%20Additions/Autoscroll%20Fix/autoscrollFix.js
	$('#chat_messages').on('scroll',function(){
		var scrollHeight = $(this)[0].scrollHeight,
			scrollTop = $(this).scrollTop(),
			height = $(this).height();
		if ((scrollHeight - scrollTop) < height*1.3){
			room.autoscroll = true;
		}else{
			room.autoscroll = false;
		}
	});
	$("#cin").on("keypress", function(e){
		if (e.which == 13){
			if ($(this).val().trim() != ''){
				socket.sendmsg(($(this).val()));
				$(this).val('');
			}
		}
	});
	$('#join_btn').click(function(){
		join();
	});
	$("#join_username").on("keypress", function(e){
		if (e.which == 13)
			join();
	});
	$("#add_video_btn").click(function(){
		var url = $("#add_video_url").val();
		if (url.trim() != '')
		{
			socket.sendcmd('add', {URL: url});
		}
		$('#add_video_url').val('');
	});
	$("#tabs_chat").click(function(){ //scrollchat to bottom when clicked
		var textarea = document.getElementById('chat_messages');
		textarea.scrollTop = textarea.scrollHeight;
	});
	$("#skip_button").click(function(){
		if (room.user.userinfo.loggedin)
			socket.sendcmd('skip', null);
		else
			room.addMessage({username: ""},"You must be logged in to vote to skip.","errortext");
	});
	function join(){
		var username = $('#join_username').val().trim();
		if (username != '' && username['match'](/^([A-Za-z0-9]|([-_](?![-_]))){1,16}$/) != null)
		{
			for (var i = 0; i < room.userlist.users['length']; i++)
			{
				if (username['toLowerCase']() == room.userlist.users[i]['username']['toLowerCase']())
				{
					alert('Name in use.');
					return false;
				}
			}
			socket.rename(username);
		}
		else
		{
			alert('Input was not a-z, A-Z, 1-16 characters.');
		}
		$('#join_username').val('');
	};
	$("#chat_messages").on("mousedown",".chat-message .username",function(e){
		if (e.which == 1){ //left click
			var user = $(this).parent().data("user");
			var modal = $('#user_profile_modal');
			$(".modal-body", modal).text("");
			$(".modal-title",modal).text(user.username);
			if (user.loggedin){
				request.getUser(user.username, function(err, user){
					if (!err){
						$(".modal-body",modal).text(user.bio);
					}
				});
			}
			else{
				$(".modal-body", modal).html("<em class='text-muted'>Not Registered</em>");
			}
			modal.modal('show');
		}
	});
	$("#playlist").on("click","li .remove-video",function(e){
		if (e.which == 1){ //left click
			var video = $(this).parent().parent().data("video");
			socket.sendcmd("remove", {info: video.info});
		}
	});
	$("#polls").on("click",".poll.active .poll-options .poll-votes",function(e){
		if (e.which == 1){ //left click
			var option = $(this).data("option");
			if (room.user.userinfo.loggedin)
			{
				socket.sendcmd("poll-vote", {vote: option});
			}
			else
			{
				//addMessage({username: ""},"You must be logged in to vote on polls.","errortext");
			}
		}
	});
	$("#polls").on("click",".poll.active .poll-controls .poll-end",function(e){
		if (e.which == 1){ //left click
			socket.sendcmd("poll-end", null);
		}
	});
}