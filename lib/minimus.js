
var fs      = require('fs'),
    path    = require('path'),
    Step	= require('step'),
    util    = require('util'),

    helpers = require('./helpers'),
    log     = helpers.log;

module.exports = function (options) {
    var settings    = helpers.settings(options),
        assets      = helpers.assets(settings.assetsFile),
        baseUrl     = helpers.baseUrl(assets);
    
    function applyTemplate (sectionName, itemName, template, extension) {
        var result = '',
            results = [],
            jstResult = '',
            jstResults = [];

        if (!helpers.validSectionAndItem(sectionName, itemName)) {
            return '';
        }

        if (settings.minfied) {
            if (assets.s3.hasOwnProperty('hash')) {
                itemName = itemName + '-' + assets.s3.hash;
            } 
            
            result = util.format(template, baseUrl + sectionName + '/' + itemName + extension);
            results.push(result);
        }
        else {
            assets[sectionName][itemName].forEach(function (item) {
                if (path.extname(item) === '.jst') {
                    var data = fs.readFileSync(process.cwd() + '/' + item, 'utf-8');

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

    function log (message) {
        if (settings.debug) {
            console.log(message);
            console.log(assets);
        }
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

    if (settings.express3) {
        return function (req, res, next) {              // use middleware
            res.locals.javascripts = javascripts;
            res.locals.stylesheets = stylesheets;
            
            next();
        }
    }
    else {
        return {                                        // use express 2.0 helpers 
            javascripts: javascripts, 
            stylesheets: stylesheets 
        };        
    }
};