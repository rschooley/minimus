
var _       = require('underscore'),
    util    = require('util'),
    yaml    = require('js-yaml'); // register .yaml require handler (mind = blown)

var helpers = {

    defaults: {
        assetsFile: process.cwd() + '/config/assets.yml',
        debug:      false,
        express3:   false,
        minify:     false
    },

    assets: function (file) {
        var result = {};

        try {
            // todo: support json or yml here
            result = require(file); // readFileSync under the hood

            // todo: don't need this for dev, just production
            if (!result.hasOwnProperty('s3')) {
                throw new Error('missing s3 section in assets file');
            }

            if (!result.s3.hasOwnProperty('bucket')) {
                throw new Error('missing bucket section in assets file');
            }
        }
        catch (err) {
            // todo: don't need this for dev, just production
        }

        return result;
    },

    baseUrl: function (assets) {
        return '//' + assets.s3.bucket + '.s3.amazonaws.com/';
    },

    endsWith: function (str, suffix) {
        // ref: http://stackoverflow.com/a/2548133/54612
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    settings: function (options) {
        var result = _.clone(this.defaults);

        // merge in any override from consuming app
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                result[key] = options[key];
            }
        }

        return result;
    },

    validSectionAndItem: function (assets, sectionName, itemName) {
        if (!assets.hasOwnProperty(sectionName)) {
            log(util.format('could not find section "%s"', sectionName));
            return false;
        }
        
        if (!assets[sectionName].hasOwnProperty(itemName)) { 
            log(util.format('could not find item "%s" in section "%s"', itemName, sectionName));
            return false;
        }

        return true;
    }
};

module.exports = helpers;
