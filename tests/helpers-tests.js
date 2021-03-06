
var should      = require('should'),

    helpers     = require('../lib/helpers');

describe('helpers', function () {
    it('should return an object', function () {
        should.exist(helpers);
        helpers.should.be.a('object');
    });

    describe('#assets', function () {
        var assetsFile = '';

        before(function () { 
            assetsFile = process.cwd() + '/tests/assets.yml';
        });

        it('should have an "assets" function', function () {
            should.exist(helpers.assets);
        });

        it('should return an object', function () {
            var assets = helpers.assets(assetsFile);

            should.exist(assets);
            assets.should.be.a('object');
        });
    });

    describe('#baseUrl', function () {
        it('should have a "baseUrl" function', function () {
            should.exist(helpers.baseUrl);
        });
    });

    describe('#defaults', function () {
        it('should have a "defaults" property', function () {
            should.exist(helpers.defaults);
            helpers.defaults.should.be.a('object');
        });

        it('should default "assets file"', function () {
            var assetsFile      = helpers.defaults.assetsFile,
                pathHasDefault  = false;

            should.exist(assetsFile);
        
            // the path changes on how this is called because of process.cwd
            // in the app it is typically where app/web/server.js resides
            // in tests it is the test dir
            // in upstart it is / (I think)
            pathHasDefault = assetsFile.indexOf('/config/assets.yml') > -1;         
            pathHasDefault.should.be.ok;
        });

        it('should default "debug" to false', function () {
            var debug = helpers.defaults.debug;

            should.exist(debug);
            debug.should.equal(false);
        });

        it('should default "express3" to true', function () {
            var express3 = helpers.defaults.express3;

            should.exist(express3);
            express3.should.equal(true);
        });

        it('should default "minify" to false', function () {
            var minify = helpers.defaults.minify;

            should.exist(minify);
            minify.should.equal(false);
        });
    });

    describe('#settings', function () {
        var settings = {};

        it('should have a "settings" function', function () {
            should.exist(helpers.settings);
        });

        it('should not override values not passed in', function () {
            settings = helpers.settings({ foo: true, bar: false });

            for (var key in helpers.defaults) {
                settings[key].should.equal(helpers.defaults[key]); 
            }
        })

        describe('should override specified value(s)', function () {
            it('for "assetsFile"', function () {
                var value = 'foo/bar/baz';

                settings = helpers.settings({ assetsFile: value });
                settings.assetsFile.should.equal(value);
            });

            it('for "debug"', function () {
                settings = helpers.settings({ debug: true });
                settings.debug.should.equal(true);
            });

            it('for "express3"', function () {
                settings = helpers.settings({ express3: true });
                settings.express3.should.equal(true);
            });

            it('for "minify"', function () {
                settings = helpers.settings({ minify: true });
                settings.minify.should.equal(true);
            });
        });
    });
});
