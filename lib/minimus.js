
var fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),

    helpers = require('./helpers'),
    log     = helpers.log;

module.exports = function (options) {
    var settings    = helpers.settings(options),
        assets      = helpers.assets(settings.assetsFile),
        baseUrl     = ''; // for production
    
    function applyTemplate (sectionName, itemName, template, extension) {
        var result      = '',
            results     = [],
            jstResult   = '',
            jstResults  = [];

        if (!helpers.validSectionAndItem(assets, sectionName, itemName)) {
            return '';
        }

        if (settings.minfied) {
            baseUrl = helpers.baseUrl(assets);

            if (assets.s3.hasOwnProperty('hash')) {
                itemName = itemName + '-' + assets.s3.hash;
            } 
            
            result = util.format(template, baseUrl + sectionName + '/' + itemName + extension);
            results.push(result);
        }
        else {
            assets[sectionName][itemName].forEach(function (item) {
                if (path.extname(item) === '.jst') {
                    var data    = fs.readFileSync(process.cwd() + '/' + item, 'utf-8'),
                        dirName = path.dirname(item).split('/').pop();

                    if (!data) throw new Error('could not read jst file: ' + item);

                    jstResult = util.format(
                        'window.JST["%s/%s"] = function() { return decodeURI("%s") };',  // dir/name for compatability with jammit
                        dirName,
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

//
// logging helper - uses debug option
//

    function log (message) {
        if (settings.debug) {
            console.log(message);
            console.log(assets);
        }
    }
    
//
// section helpers
//

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

//
// result
//

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