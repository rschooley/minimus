
var fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),

    helpers = require('./helpers'),
    log     = helpers.log;

module.exports = function (options) {
    var settings    = helpers.settings(options),
        assets      = helpers.assets(settings.assetsFile);
    
    function applyTemplate (sectionName, itemName, template, extension) {
        var result = '';

        if (!helpers.validSectionAndItem(assets, sectionName, itemName)) {
            return '';
        }

        if (settings.minfied) {
            result = applyMinifiedTemplate(sectionName, itemName, template, extension);
        }
        else {
            result = applyUnminifiedTemplate(sectionName, itemName, template);
        }

        return result;
    }

//
// process item helpers
//

    function applyMinifiedTemplate (sectionName, itemName, template, extension) {
        var baseUrl = helpers.baseUrl(assets),
            itemUrl = '';

        if (assets.s3.hasOwnProperty('hash')) {
            itemName = itemName + '-' + assets.s3.hash;
        }

        itemUrl = [baseUrl, sectionName, '/', itemName, extension].join();

        return util.format(template, itemUrl);
    }

    function applyUnminifiedTemplate (sectionName, itemName, template) {
        var items   = assets[sectionName][itemName];
            results = {};

        results = {
            js:         [],
            jst:        [],
            processed:  {} 
        };

        processItems(results, items, template);

        if (results.jst.length > 0) {
            jst = '<script>\nwindow.JST = {};\n' + results.jst.join('\n') + '\n</script>'
            
            results.js.push(jst);
        }
        
        return results.js.join('\n');
    }

    function processItems (results, items, template) {
        var itemValue = '';
            
        items.forEach(function (item) {
            if (!results.processed.hasOwnProperty(item)) {
                results.processed[item] = true;
            
                if (helpers.endsWith(item, '*')) {                              // wildcard dir
                    processDir(results, item, template);
                }
                else if (path.extname(item) === '.jst') {                       // jst
                    itemValue = processJstItem(item);

                    results.jst.push(itemValue);
                }
                else {                                                          // css & js 
                    itemValue = item.replace('public/', '');                    // todo: args (this is gonna hurt someone)
                    itemValue = util.format(template, '/' + itemValue);

                    results.js.push(itemValue);
                }
            }
        });
    }

    function processDir (results, item, template) {
        var baseDir = item.replace('*', ''),
            items   = [];
                
        items = fs
            .readdirSync(process.cwd() + '/' + baseDir, 'utf-8')    // todo: move pathing to args
            .map(function (file) {                
                return item.replace('*', file);
            });

        processItems(results, items, template);
    }

    function processJstItem (item) {
        var data    = '',
            dirName = '',
            result  = '';

        data    = fs.readFileSync(process.cwd() + '/' + item, 'utf-8'),     // todo: move pathing to args
        dirName = path.dirname(item).split('/').pop();

        if (!data) {
            throw new Error('could not read jst file: ' + item);
        }

        result = util.format(
            'window.JST["%s/%s"] = function() { return decodeURI("%s") };',  // dir/name for compatability with jammit
            dirName,
            path.basename(item, '.jst'),
            encodeURI(data)
        );

        return result;
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