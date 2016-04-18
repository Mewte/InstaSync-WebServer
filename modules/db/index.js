var config = require('../../config');
var knex = require('knex')({
	client: 'mysql',
	connection: {
		host     : config.db_host,
		user     : config.db_user,
		password : config.db_pass,
		database : config.db_name
	},
	pool:{
		min: 2,
		max: 10
	}
});
module.exports = knex;