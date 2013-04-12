
var fs      = require('fs'),
    glob    = require('glob'),
    path    = require('path'),
    Step    = require('step'),
    util    = require('util'),
    yaml    = require('js-yaml'); // register .yaml require handler

module.exports = function (options) {
    var assets          = {},
        assetsBaseUrl   = '',
        cwd             = process.cwd(),

        // options
        callback        = function () {},
        debug           = false,
        useMinified     = false,
        yamlFilePath    = process.cwd() + '/config/assets.yml',
        express3        = false;

    if (options) {
        callback        = options.callback || callback;
        debug           = options.debug || debug;
        yamlFilePath    = options.yamlFilePath || yamlFilePath;
        useMinified     = options.useMinified || useMinified;
        express3        = options.express3 || express3;
    }

    (function initialize () {
        try {
            assets = require(yamlFilePath);

            if(assets.javascripts) {
                Object.keys(assets.javascripts).forEach(function (name) {
                    assets.javascripts[name] = flattenPaths(assets.javascripts[name]);
                });
            }

            if(assets.stylesheets) {
                Object.keys(assets.stylesheets).forEach(function (name) {
                    assets.stylesheets[name] = flattenPaths(assets.stylesheets[name]);
                });
            }

            if (!assets.hasOwnProperty('s3')) throw new Error('missing s3 section in yaml file');
        }
        catch (err) {
            return callback(err);
        }

        if (assets.s3.hasOwnProperty('endpoint')) {
            assetsBaseUrl = '//' + assets.s3.endpoint + '/';  // have an extra slash? you're bug is here
        }
        else {
            assetsBaseUrl = '//' + assets.s3.bucket + '.s3.amazonaws.com' + '/';
        }
    })();

    function log (message) {
        if (debug) {
            console.log(message);
            console.log(assets);
        }
    }

    function flattenPaths (paths) {
        var result = {};

        paths.forEach(function (path) {
            glob.sync(path).forEach(function (file) {
                if(!result[file]) {
                    result[file] = true;
                }
            });
        });

        return Object.keys(result);
    }

    function applyTemplate (sectionName, itemName, template, extension) {
        var result = '',
            results = [],
            jstResult = '',
            jstResults = [];

        // if (itemName.indexOf('-min') === -1) {
        //     itemName = itemName + '-min';
        // }

        if (!assets.hasOwnProperty(sectionName)) {
            log(util.format('could not find section "%s"', sectionName));
            return '';
        }

        if (!assets[sectionName].hasOwnProperty(itemName)) {
            log(util.format('could not find item "%s" in section "%s"', itemName, sectionName));
            return '';
        }

        if (useMinified) { // seriously, check this in
            if (assets.s3.hasOwnProperty('hash')) {
                itemName = itemName + '-' + assets.s3.hash;
            }

            result = util.format(template, assetsBaseUrl + sectionName + '/' + itemName + extension);
            results.push(result);
        }
        else {
            assets[sectionName][itemName].forEach(function (item) {
                if (path.extname(item) === '.jst') {
                    var data = fs.readFileSync(cwd + '/' + item, 'utf-8');

                    if (!data) throw new Error('could not read jst file: ' + item);

                    jstResult = util.format(
                        'window.JST["%s"] = function() { return decodeURI("%s") };',
                        path.basename(item, '.jst'),
                        encodeURI(data)
                    );

                    jstResults.push(jstResult);
                }
                else {
                    item = item.replace('public/', '');                 // todo: args (this is gonna hurt someone)

                    result = util.format(template, '/' + item);
                    results.push(result);
                }
            });
        }

        if (jstResults.length > 0) {
            jstResult = '<script>\nwindow.JST = {};\n' + jstResults.join('\n') + '\n</script>';

            results.push(jstResult);
        }

        return results.join('\n');
    }

    function javascripts (itemName) {
        var sectionName = 'javascripts',
            template    = '<script src="%s"></script>';

        return applyTemplate(sectionName, itemName, template, '.js');
    }

    function stylesheets (itemName) {
        var sectionName = 'stylesheets',
            template    = '<link href="%s" rel="stylesheet">';

        return applyTemplate(sectionName, itemName, template, '.css');
    }

    if (express3) {
        // use middleware
        return function (req, res, next) {
            res.locals.javascripts = javascripts;
            res.locals.stylesheets = stylesheets;

            next();
        };
    }
    else {
        // use express 2.0 helpers
        return {
            javascripts: javascripts,
            stylesheets: stylesheets
        };
    }
};
