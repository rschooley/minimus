
var fs      = require('fs'),
    path    = require('path'),
    Step	= require('step'),
    util    = require('util'),
    yaml    = require('yaml');

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
        Step(
            function readYamlFile () {
                fs.readFile(yamlFilePath, 'utf-8', this);
            },
            function parseYamlFile (err, data) {
                if (err) return callback(err);
                
                try {
                    assets = yaml.eval(data); 
                    
                    if (!assets.hasOwnProperty('s3')) throw new Error('missing s3 section in yaml file');
                     
                    if (assets.s3.hasOwnProperty('endpoint')) {
                        assetsBaseUrl = '//' + assets.s3.endpoint + '/';  // have an extra slash? you're bug is here 
                    }
                    else {
                        assetsBaseUrl = '//' + assets.s3.bucket + '.s3.amazonaws.com' + '/';
                    }
                }
                catch (err) {
                    return this(err);
                }
                
                this(undefined);
            },
            function done (err) {
                if (err) return callback(err);
            }
        );
    })();
    
    function log (message) {
        if (debug) {
            console.log(message);
            console.log(assets);
        }
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
        
        
        if (useMinified) {
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
        }
    }
    else {
        // use express 2.0 helpers 
        return {
            javascripts: javascripts, 
            stylesheets: stylesheets 
        };        
    }
};