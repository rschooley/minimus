
var _ = require('underscore');

var helpers = {

	defaults: {
		assetsFile: process.cwd() + '/config/assets.yml',
		debug: 		false,
		express3: 	false,
		minify: 	false
	},

	log: function (message) {
        if (this.debug) {
            console.log(message);
        }
    },

	settings: function (options) {
		var result = _.clone(this.defaults);

		// merge in any override from user
		for (var key in options) {
			if (options.hasOwnProperty(key)) {
				result[key] = options[key];
			}
		}

		// set debug flag for other functions once the options are merge
		this.debug = result['debug'];

		return result;
	}
};

module.exports = helpers;
