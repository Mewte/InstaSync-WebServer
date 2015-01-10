/* Custom Helpers */
var config = require('./config');
var helpers = require('./helpers');
/* Third party helpers */
var cloudflare = require('cloudflare-express');
var express = require('express');
var engine = require('ejs-locals');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var fs = require('fs');
var app = express();
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
helpers.queries.setDb(knex);
//Automaticly create styles.css incase it doesnt exist (nessecary for .less parser)
//because we have it gitignored since its generated at runtime.
fs.appendFileSync("./public/css/styles.css", "");

var routes = {
	pages: require('./routes/pages'),
	rooms: require('./routes/rooms'),
	ajax: require('./routes/ajax')
};

app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cloudflare.restore());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public'), {force: true}));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 259200}));

app.use(helpers.url_formater.removeTrailingSlashes);
app.use(helpers.url_formater.noFileExtensions);

app.use(function(req,res,next){ //remove after converting to helpers.queries
	req.db = knex;
	next();
});
app.use('/', routes.pages); //fallback to pages first
app.use('/r/', routes.rooms);
app.use('/rooms/', routes.rooms);
app.use('/ajax/', routes.ajax);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next({
		status: 404
	});
});
var error_handler = function(err, req, res, next){
	if (err.status == 404){
		err.message = "File not found.";
		err.stack = "URL : "+req.url+" could not be located on this server.";
	}
	if (config.environment == "dev"){
		/// error handlers
		// development error handler
		// will print stacktrace
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	}
	else{
		// production error handler
		// no stacktraces leaked to user
		res.status(err.status || 500);
		if (err.status == 500){//hide server errors from client
			err.message = "A server error has occured. Please try again later.";
		}
		res.render('error', {
			message: err.message,
			error: {
				stack:"",
				status:err.status
			}
		});
	}
};
app.use(error_handler);

/*
 * helper functions
 */
app.locals.commaSeparateNumber = function(val){
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
 };

module.exports = app;
