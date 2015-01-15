/*
    <InstaSync - Watch Videos with friends.>
    Copyright (C) 2015  InstaSync
*/
function poll(room, socket){
	var self = this;
	this.create = function(poll){
		$("#tabs_polls_content .poll.active").removeClass("active");
		var pollEle = $("<div>",{class: "poll active"});
		if (room.user.isMod){ //mod controls
			pollEle.append($("<div>",{
				class:"mod poll-controls",
				html: $("<i>",{class:"fa fa-pencil"}).prop('outerHTML') +" "+ $("<i>",{class: "fa fa-close poll-end"}).prop('outerHTML') //ALL THIS JUST TO ADD A SPACE
			}));
		}
		var title = $("<div>",{
			class:"poll-title"
		});
		title.html(linkify(title.text(poll.title).html())); //->text()->html() filters out < > etc.
		pollEle.append(title);
		var pollOptionsEle = $("<div>",{class:"poll-options"});
		for (var i = 0; i < poll.options.length; i++){
			var voteEle = $("<span>",{class:"poll-votes",text:poll.options[i].votes});
			voteEle.data("option",i);
			var textEle = $("<span>",{class:"poll-text"});
			textEle.html(linkify(textEle.text(poll.options[i].option).html()));
			pollOptionsEle.append($("<div>",{class: "poll-option",}).append(voteEle).append(textEle));
		}
		pollEle.append(pollOptionsEle);
		$("#tabs_polls_content").prepend(pollEle);
	};
	this.end = function(){
		$("#tabs_polls_content .poll.active").removeClass("active");
	};
	this.addVote = function(option){
		var element = $("#tabs_polls_content .poll.active .poll-options .poll-option .poll-votes")[option];
		$(element).text(parseInt($(element).text(), 10) + 1);
	};
	this.removeVote = function(option){
		var element = $("#tabs_polls_content .poll.active .poll-options .poll-option .poll-votes")[option];
		$(element).text(parseInt($(element).text(), 10) - 1);
	};
	return this;
}