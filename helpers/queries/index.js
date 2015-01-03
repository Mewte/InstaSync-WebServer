/*
 * Store all queries here as functions which take parameters and return a knex promise
 */
var queries = function(){
	var db;
	this.setDb = function(DB){
		db = DB;
	};
	this.getLoggedInUser = function(auth_token, username){
			return db.select(["id as user_id","username","avatar","bio","created"]).from('users').where({cookie: auth_token, username: username}).limit(1).then(function(rows){
				if (rows.length == 0){
					return false;
				}
				else{
					return rows[0];
				}
			}).catch(function(err){
				throw err;
			});
	};
	this.isMod = function(username, room){
		return db.select().from('mods').where("mods.room_name",room).where("mods.username",username).limit(1)
		.then(function(result){
			if (result.length == 0) //not a mod of this room, return false
				return false;
			else
				return true;
		}).catch(function(err){
			throw err;
		});
	};
	this.getMods = function(room){
		return db.select(["users.id as user_id","users.username","users.avatar","users.bio"])
			.from('users').join('mods','mods.username','users.username')
			.where("mods.room_name",room);
	};
}
module.exports = new queries();