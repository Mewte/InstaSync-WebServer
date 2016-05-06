$(function() {
	var socket = new friend_socket();
	var user = {};
	var friend_interface = new function(){
		var self = this;
		var onlineCount = 0;
		var unreadCount = 0;
		this.buildFriendsList = function(friends){
			var friendsListEle = $("#friends_list");
			onlineCount = 0;
			friendsListEle.empty();
			var friendsElements = []; //cache to array and build dom in one run
			for (var i = 0; i < friends.length; i++){
				var ele = $("<li/>",{
					id: "friend_id_"+friends[i].id,
					data: {id: friends[i].id,username: friends[i].username}
				});
				ele.append([
					$("<img>",{
						class:"friend-avatar",
						src: "https://i.imgur.com/"+friends[i].avatar+"s.jpg",
						onerror: "if (this.src != '/images/no-profile.gif') this.src = '/images/no-profile.gif';"
					}),
					$("<span/>",{
						class:"friend-username",
						text: friends[i].username
					}),
					$("<div/>",{
						class:"friend-user-controls",
						html: $("<div/>",{
							class: "status " + friends[i].status
						})
					})
				]);
				if (friends[i].status == "online"){
					onlineCount++;
				}
				friendsElements.push(ele);
			}
			friendsListEle.append(friendsElements);
			$("#friends_online").text(onlineCount);

		};
		this.buildMessageOverview = function(messages){
			var messageListEle = $("#conversation_list");
			messageListEle.empty();
			var messageElements = []
			for (var i = 0; i < messages.length; i ++){
				var sentDate = new Date(messages[i].sent*1000);
				var ele = $("<li/>",{
					id: "conversation_overview_"+messages[i].friend_id,
					data: {id: messages[i].friend_id, username: messages[i].username, sent: messages[i].sent},
					class: (messages[i].from_id != user.user_id && !messages[i].viewed ? "unread" : "read")
				});
				ele.append([
					$("<div/>",{class:"conversation-user-info"}).append([
						$("<img>",{
							class:"friend-avatar",
							src: "https://i.imgur.com/"+messages[i].avatar+"s.jpg",
						}),
						$("<div/>",{
							class:"friend-username",
							text: messages[i].username
						}),
						$("<time/>", {
							class: "timeago timestamp",
							text: sentDate.toDateString() + " " + sentDate.toLocaleTimeString(),
							datetime: messages[i].sent
						})
					]),
					$("<div/>",{class:"conversation-info"}).append([
						$("<div/>",{
							class:"type",
							append:$("<i>",{
								class:"fa "+(messages[i].to_id == user.user_id ? "" : "fa-reply")
							})
						}),
						$("<div/>",{
							class:"message",
							text: messages[i].message
						})
					])
				]);
				messageElements.push(ele);
			}
			messageListEle.append(messageElements);
			jQuery("time.timeago").timeago();
		};
		this.addMessage = function(message,pending){
			var conversation = $($("#opened_conversation_"+message.friend_id)[0]);
			var conversation_overview = $("#conversation_id_"+message.friend_id);
			if (conversation){ //conversation element exist
				// add to chat box
				var messageEle = createMessageHTML(message.message,message.from_id == user.user_id ? "to" : "from",pending,message.sent);
				$("#friend_messages_"+message.friend_id).append(messageEle);
				if (conversation.is(":visible")){ //is already open
					//mark as read to socket,
					//mark as read on message overview
				}
				else{

				}
				$("#friend_messages_"+message.friend_id).scrollTop($("#friend_messages_"+message.friend_id).prop("scrollHeight"));
				return messageEle;
			}
			//add to conversation overview
		};
		this.updateConversationOverview = function(user_id, message){
			var overview = $("#conversation_overview_"+user_id)[0];
			if (overview){ //update element

			}
			else{ //create new overview element

			}

		};
		this.openConversation = function(user_id,username){
			var conversation = $("#opened_conversation_"+user_id);
			if (conversation.length > 0){
				$("#conversation_list").hide();
				conversation.show();
			}
			else{
				$("#friends_modal .loading").show();
				socket.getConversation(user_id,null,function(data){
					$("#friends_modal .loading").hide();
					if (data.error){
						
					}
					else{
						var ele = createConversationHTML({user_id:user_id,username:username},data.messages);
						$("#tabs_friendslist_conversations").prepend(ele);
						$("#conversation_list").hide();
						$(".opened-conversation").hide();
						$("#opened_conversation_"+user_id).show();
						$("#friend_messages_"+user_id).scrollTop($("#friend_messages_"+user_id).prop("scrollHeight"));
					}
				});
			}
		};
		this.addFriend = function(friend){

		};
		this.removeFriend = function(friend){
			
		}
		this.friendOnline = function(friend){

		};
		this.friendOffline = function(friend){
			
		};
		function sortConversations(){

		}
		function timestampSort(){
			
		}
		function createConversationHTML(user,messages){
			var ele = $("<div/>",{
				class:"opened-conversation",
				id:"opened_conversation_"+user.user_id
			});
			var messageElements = [];
			for (var i = 0; i < messages.length; i++){
				messageElements.push(createMessageHTML(messages[i].message,messages[i].from_id == user.user_id?"from":"to",false,messages[i].sent));
			}
			ele.append([
				$("<div/>",{class:"header-bar"}).append([
					$("<div/>",{
						class:"back",
						append: $("<button/>",{
							class:"btn btn-primary-outline",
							title:"Back",
							append:$("<i/>",{class:"fa fa-arrow-left"})
						})
					}),
					$("<i/>",{class:"fa fa-comments"}),
					$("<span/>",{class:"whispering-with",text:" "+user.username})
				]),
				$("<div/>",{class:"conversation-chat-box"}).append([
					$("<div/>",{class:"friend-messages",id: "friend_messages_"+user.user_id}).append(messageElements),
					$("<div/>",{class:"input-group whisper-input"}).append([
						$("<input/>",{type:"text",class:"form-control whisper-textbox",placeholder:"Send message...", attr:{maxlength: 240},data:{user_id:user.user_id}}),
						$("<span/>",{class:"input-group-btn"}).append(
							$("<button/>",{
								class:"btn btn-primary-outline whisper-send",
								type:"button",
								text:"Send"
							})
						)
					])
				]),
				$("<div/>",{class:"message-expiration-notice"}).append("<em>Messages may expire after 30 days.</em>")
			]);
			return ele;
		}
		function createMessageHTML(message, css, pending,sent){
			var sentDate = new Date(sent*1000);
			var ele = $("<div/>", {
				class: "friend-message "+css,
				title: sentDate.toDateString() + " " + sentDate.toLocaleTimeString(),
				text: message
			});
			if (pending){
				ele.append(' <i title="Sending.." class="sending fa fa-circle-o-notch fa-spin"></i>');
				return ele;
			}
			else{
				return ele;
			}
		}
		function createOverviewHTML(){

		}
		(function createBindings(){
			$("#friends_list").on('click', 'li', function(e){ //friends list user left click
				if (e.which == 1){
					self.openConversation($(this).data("id"),$(this).data("username"));
					$("#message_tab").tab("show");
				}
			});
			$("#conversation_list").on('click', 'li', function(e){ //friends list user left click
				if (e.which == 1){
					self.openConversation($(this).data("id"),$(this).data("username"));
				}
			});
			$("#tabs_friendslist_conversations").on('click','.back',function(e){ //private message back button
				$(this).parent().parent().hide();
				$("#conversation_list").show();
			});
			$("#tabs_friendslist_conversations").on('click','.whisper-send',function(e){

			});
			$("#tabs_friendslist_conversations").on('keypress','.whisper-textbox',function(e){
				if (e.which == 13){
					var message = $(this).val();
					var friend_id = $(this).data("user_id");
					var msgEle = self.addMessage({message: message, from_id: user.user_id, to_id: friend_id, friend_id: friend_id},true);
					socket.sendMessage($(this).data("user_id"),$(this).val(),function(data){
						if (msgEle)
							if (data.success){
								msgEle.children(".sending").remove();
								var now = new Date();
								msgEle.attr("title",now.toDateString() + " " + now.toLocaleTimeString());
							}
							else{
								msgEle.children(".sending").addClass("error");
							}
					});
					$(this).val("");
				}
			});
			var searchUser = function(){
				var username = $("#search_user_text").val();
				request.getUser(username,function(err,user){
					if (err && err.responseJSON){
						$("#ERROR_ID_GOES_HERE").text(err.responseJSON.message);
						$("#search_send_request").hide();
					}
					else{
						$("#search_avatar").attr("src","https://i.imgur.com/"+user.avatar+"b.jpg");
						$("#search_bio").text(user.bio);
						$("#search_send_request").show();
					}
				})
			}
			$("#search_user_btn").click(searchUser);
			$("#search_user_text").keypress(function (e) {
				if (e.which == 13){
					searchUser();
				}

			});
			$("#search_send_request").click(function(){
				var username = $("search_user_text");

			});
		})();
	}();

	function friend_socket(){
		var server = "";
//		if (location.protocol.toLowerCase() == "http:"){
//			server = CHAT_SERVER.host +":"+ CHAT_SERVER.port;
//		}
//		else{
//			server = SECURE_CHAT_SERVER.host + ":" + SECURE_CHAT_SERVER.port;
//		}
		server = "http://localhost:8080"
		var socket = io(server);

		socket.on('connect', function () {
			console.log('connected');
		});
		socket.on('start_up_data', function(data){
			user = data.user;
			friend_interface.buildFriendsList(data.friends);
			friend_interface.buildMessageOverview(data.messages);
			//friend_interface.buildFriendRequests(data.friend_requests);
		});
		socket.on("new_message",function(data){
			console.log(data);
			//friend_interface.addMessage(data.message,false);
		});
		socket.on('online',function(user){
			friend_interface.friendOnline(user);
		});
		socket.on('offline',function(user){
			friend_interface.friendOffline(user);
		});
		socket.on('error',function(error){
			console.log(error);
		});
		this.sendMessage = function(user_id,message,callback){
			socket.emit("send_message",{user_id: user_id, message: message},function(data){
				callback(data);
			});
		};
		this.getConversation = function(user_id,beforeID,callback){//beforeID is used for pagination, get messages before this ID
			socket.emit("get_conversation",{user_id: user_id,before:beforeID},function(data){
				callback(data);
			});
		};
		this.markRead = function(user_id, callback){
			socket.emit("mark_read",{user_id: user_id}, function(data){

			});
		};
		this.sendFriendRequest = function(username, callback){

		}
		window.dev_socket = socket;
	}
	window.dev_interface = friend_interface;
});
