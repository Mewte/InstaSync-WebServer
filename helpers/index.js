//load all models
var fs = require("fs");
var helpers = {};
fs.readdirSync(__dirname).forEach(function(file) {
	var stat = fs.statSync(__dirname + "/"+ file);
	if (stat.isDirectory()){ //if model folder exists, load model
		helpers[file] = require("./"+file);
	}
});
module.exports = helpers;