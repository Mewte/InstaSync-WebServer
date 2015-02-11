/*
 * Store all queries here as functions which take parameters and return a knex promise
 */
var crypto = require('crypto');
var moment = require('moment');
var queries = function(){
	var self = this;
	var db;
	this.setDb = function(DB){
		db = DB;
	};
	this.login = function(username, prehash){
		var hashed = hash(prehash);
		//Note for below: .bind({}) forces 'this' to be shared among each promise resolution. Handy for passing data between promises
		return db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({username:username, hashpw: hashed}).limit(1).bind({})
			.then(function(results){
				if (results.length == 0){
					var error = new Error("Invalid username or password.");
					error.type ="invalid_credentials";
					throw error;
				}
				this.user = results[0];
				this.user.auth_token = crypto.pseudoRandomBytes(20).toString('hex');
				return db('users').update({cookie: this.user.auth_token, last_login: moment().format("YYYY-MM-DD HH:mm:ss")}).where({id: this.user.user_id});
			}).then(function(){
				return this.user;
			}).catch(function(err){throw err;});
	};
	this.register = function(username){

	};
	this.changePassword = function(user_id,currentPass,newPass){
		return db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({id:user_id, hashpw: hash(currentPass)}).limit(1).bind({})
			.then(function(results){
				if (results.length == 0){
					var error = new Error("Invalid current password. Please try again.");
					error.type ="password_mismatch";
					throw error;
				}
				else{
					this.user = results[0];
					return db('users').update({hashpw: hash(newPass)}).where({id: this.user.user_id}).limit(1);
				}
			}).then(function(){
				return this.user;
			}).catch(function(err){throw err;});
	};
	this.getLoggedInUser = function(auth_token, username){
		return db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({cookie: auth_token, username: username}).limit(1).then(function(rows){
			if (rows.length == 0)
				return null;
			else
				return rows[0];
		}).catch(function(err){throw err;});
	};
	this.getUser = function(username){
		return db.select(['username','avatar','bio', 'created']).from('users').where({username:username}).limit(1)
		.then(function(results){
			if (results.length == 0)
				return null;
			else
				return results[0];
		})
		.catch(function(err){throw err;});
	};
	this.updateUser = function(user_id,avatar,bio){
		var update = {};
		if (avatar != undefined)
			update.avatar = avatar;
		if (bio != undefined)
			update.bio = bio;
		if (Object.keys(update).length === 0){//just to return a promise
			return db.select(db.raw("1 as one"));
		}
		return db('users').update(update).where({id: user_id}).limit(1);
	};
	this.getRoom = function(room){
		return db.select().from('rooms').where({room_name:room}).limit(1)
		.then(function(results){
			if (results.length == 0)
				return null;
			else
				return results[0];
		})
		.catch(function(err){throw err;});
	};
	this.updateRoom = function(room_name,listing,description,info){
		var update = {};
		if (listing != undefined)
			update.listing = listing;
		if (description != undefined)
			update.description = description;
		if (info != undefined)
			update.info = info;
		if (Object.keys(update).length === 0){ //just to turn a promise
			return db.select(db.raw("1 as one"));
		}
		return db('rooms').update(update).where({room_name: room_name}).limit(1);
	};
	this.isMod = function(username, room){
		return db.select().from('mods').where("mods.room_name",room).where("mods.username",username).limit(1)
		.then(function(result){
			if (result.length == 0) //not a mod of this room, return false
				return false;
			else
				return true;
		}).catch(function(err){throw err;});
	};
	this.getMods = function(room){
		return db.select(["users.id as user_id","users.username","users.avatar","users.bio","users.created"])
			.from('users').join('mods','mods.username','users.username')
			.where("mods.room_name",room);
	};
	this.addMod = function(room,username){
		return db("mods").insert({room_name: room, username: username, permissions: 1});
	};
	this.removeMod = function(room,username){
		return db("mods").where('username',username).where('room_name',room).del();
	};
	this.getResets = function(ip){
		var now = moment().unix();
		return db.select().from("resets").where("time", ">", now - 60 * 60).where("ip", ip);
	};
	this.createReset = function(email, username, ip){
		var now = moment().unix();
		var token = crypto.pseudoRandomBytes(30).toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
		return db("resets").insert(db.raw("(token, user_id, time, ip) " + db.select(db.raw("? as token, id as user_id, ? as time, ? as ip",[token,now,ip])).from("users").where("username",username).where("email", email).toString()))
			.then(function(id){
				if (id == 0){
					return null;
				}
				return token;
			}).catch(function(err){
					throw err;
			});

	};
	this.getReset = function(token){
		var now = moment().unix();
		return db.select().from('resets').where({token:token}).then(function(results){
			if ((results.length == 0) || (results[0].time < (now - 60*60*3))){
				var error = new Error("Invalid or expired reset token.");
				error.type = "bad_token";
				throw error;
			}
			return results[0];
		}).catch(function(err){
			throw err;
		});
	};
	this.resetPassword = function(token, newPass){
		return self.getReset(token).bind({}).then(function(reset){
			this.reset = reset;
			return db('users').update({hashpw: hash(newPass)}).where({id: this.reset.user_id}).limit(1);
		}).then(function(){
			return db('resets').where('user_id',this.reset.user_id).del();
		}).then(function(){
			return false; //return no error
		}).catch(function(err){
			throw err;
		});
	};
	this.getBans = function(room){
		return db.select(["username","loggedin"])
			.from('bans').where("room_name",room);
	};
	this.removeBan = function(ban_id, room){

	}
	function hash(text){
		return crypto.createHash('sha1').update(text).digest('hex');
	}
}
module.exports = new queries();