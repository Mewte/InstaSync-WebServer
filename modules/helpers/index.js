var fs = require("fs");
var helpers = {};
fs.readdirSync(__dirname).forEach(function(file) {
	var stat = fs.statSync(__dirname + "/"+ file);
	if (stat.isDirectory()){
		helpers[file] = require("./"+file);
	}
});
module.exports = helpers;