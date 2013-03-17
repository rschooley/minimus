
var _ = require('underscore');

var helpers = {

	defaults: {
		debug: 		false,
		express3: 	false,
		minify: 	false
	},

	settings: function (options) {
		var result = _.clone(this.defaults);

		// merge in any override from user
		for (var key in options) {
			if (options.hasOwnProperty(key)) {
				result[key] = options[key];
			}
		}

		return result;
	}
};

module.exports = helpers;
