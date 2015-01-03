/*
 * Store all queries here as functions which take parameters and return a knex promise
 */
var crypto = require('crypto');
var moment = require('moment');
var queries = function(){
	var db;
	this.setDb = function(DB){
		db = DB;
	};
	this.login = function(username, prehash){
		var hashed = crypto.createHash('sha1').update(prehash).digest('hex');
		//Note for below: .bind({}) forces 'this' to be shared among each promise resolution. Handy for passing data between promises
		return db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({username:username, hashpw: hashed}).limit(1).bind({})
			.then(function(results){
				if (results.length == 0){
					return null;
				}
				else{
					this.user = results[0];
					this.user.auth_token = crypto.pseudoRandomBytes(20).toString('hex');
					return db('users').update({cookie: this.user.auth_token, last_login: moment().format("YYYY-MM-DD HH:mm:ss")}).where({id: this.user.user_id});
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
		return db.select(['username','avatar','bio']).from('users').where({username:username}).limit(1)
		.then(function(results){
			if (results.length == 0)
				return null;
			else
				return results[0];
		})
		.catch(function(err){throw err;});
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
		return db.select(["users.id as user_id","users.username","users.avatar","users.bio"])
			.from('users').join('mods','mods.username','users.username')
			.where("mods.room_name",room);
	};
}
module.exports = new queries();