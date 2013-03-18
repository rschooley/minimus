
var should      = require('should'),

	minimus		= require('../lib/minimus');

describe('minimus', function () {
	describe('with settings', function () {
		
		describe('for express 2.x', function () {
			var assets 		= {},
				assetsFile 	= process.cwd() + '/tests/assets.yml';

			before(function () {
				assets = minimus({ assetsFile: assetsFile, express3: false });
			});

			it('should return an object', function () {
				should.exist(assets);
				assets.should.be.a('object');
			});

			it('should have a "javascripts" function', function () {
				should.exist(assets.javascripts);
				assets.javascripts.should.be.a('function');
			});

			it('should have a "stylesheets" function', function () {
				should.exist(assets.stylesheets);
				assets.stylesheets.should.be.a('function');
			});
		});

		describe('for express 3.x', function () {
			var assets 		= {},
				assetsFile 	= '',
				req 		= {},
				res 		= {};

			before(function () {
				assetsFile 	= process.cwd() + '/tests/assets.yml';
				assets 		= minimus({ assetsFile: assetsFile, express3: true });

				res = {
					locals: {}
				}; 
			});

			it('should return a function', function () {
				should.exist(assets);
				assets.should.be.a('function');
			});

			it('should call next()', function (done) {
				assets(req, res, done);
			});

			it('should set res.locals.javascripts to a function', function () {
				assets(req, res, function () {
					should.exist(res.locals.javascripts);
					res.locals.javascripts.should.be.a('function');
				});
			});

			it('should set res.locals.stylesheets to a function', function () {
				assets(req, res, function () {
					should.exist(res.locals.stylesheets);
					res.locals.stylesheets.should.be.a('function');
				});
			});
		});
	});
});
