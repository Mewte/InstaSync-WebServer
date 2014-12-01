$(function() {
	$("#register").click(function(){register();});
	var pendingRegistration = false;
	function register(){
		if (pendingRegistration){
			return;
		}
		$("#invalid_register_message").text("");
		$(".register-form .has-error").removeClass("has-error");
		var username = $("#register_username").val();
		var password = $("#register_password").val();
		var confirmPass = $("#register_confirm_password").val();
		var email = $("#register_email").val();
		if (password != confirmPass)
		{
			$("#invalid_register_message").text("Passwords do not match.");
			addError("register_password");
			addError("register_confirm_password");
			return;
		}
		request.register({username: username, password: password, email: email}, function(err,data){
			pendingRegistration = false;
			if (err){
				outputError(err.responseJSON.message);
				if (err.responseJSON.field_name){
					var field = err.responseJSON.field_name;
					if (field == "username"){
						addError("register_username");
					}
					if (field == "password"){
						addError("register_password");
						addError("register_confirm_password");
					}
					if (field == "email"){
						addError("register_email");
					}
				}
			}
			else{
				//register success, refresh page (In the future, login without refresh)
				window.location = document.URL;
			}
		});
		function outputError(text){
			$("#invalid_register_message").text(text);
		}
		function addError(field){
			$("#"+field+"_box").addClass("has-error");
		};
	}
	$("#login").click(function(){login();});
	$("#login_inputs").keypress(function(e){
		if (e.which == 13)
			login();
	});
	var pendingLogin = false;
	function login(){
		if (pendingLogin){
			return;
		}
		$("#invalid_login_message").text("");
		$(".login-form .has-error").removeClass("has-error");
		var username = $("#login_username").val();
		var password = $("#login_password").val();
		pendingLogin = true;
		request.login({username: username, password: password}, function(err,data){
			pendingLogin = false;
			if (err || !(data && data.user_id)){ //err is set, or data.user_id is missing. (server returns user on success)
				outputError(err.responseJSON.message);
				if (err.status == 403 || err.status == 422){ //invalid username or password, or bad format
					addError();
				}
			}
			else{
				window.location = document.URL;
			}
		});
		function outputError(text){
			$("#invalid_login_message").text(text);
		}
		function addError(){
			$("#login_inputs").addClass("has-error");
		};
	}
	function checklogin(){
		request.checklogin(function(err,data){
			if (err || !(data && data.user_id)){ //err: 403 if not logged in, or user_id not set
				$("#login_dropdown").fadeIn(500);
				$("#register_dropdown").fadeIn(500);
			}
			else{
				$("#logged_in_as").text($.cookie("username"));
				$("#user_dropdown").show();
			}
		});
	}
	checklogin();
	$("#logout").click(function(){
		request.logout(function(){
			window.location = document.URL;
		});
		return false;
	});
});