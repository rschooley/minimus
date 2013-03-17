
var should      = require('should'),

	minimus		= require('../lib/minimus');

describe('minimus', function () {
	describe('with settings', function () {
		describe('for express 2.x', function () {
			var assets = {};

			before(function () {
				assets = minimus({ express3: false });
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
			var assets 	= {},
				req 	= {},
				res 	= {};

			before(function () {
				assets = minimus({ express3: true });

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
