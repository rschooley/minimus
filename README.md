Overview
=======

Asset bundler and deployer for node and S3.

Install
=============
Minimus is currently not available through npm.  The project can be loaded by adding the following to your package.json file:

```javascript
{
    ....
    "minimus": "git+https://github.com/rschooley/minimus.git",
    ...
}
```

current state
=============
The initial seed is a fully working module from a production app.  The code is not an npm package, doesn't have unit tests, and has a lot of hard coding going on.  It does load assets from yaml uncompressed in dev (NODE_ENV), minified in prod, and uses jammit to bundle assets and then pushes them to S3.

*You should not be using this unless you are me, in which case then go right ahead.  There is much to be done before others can use this.*

sample yaml file
================
sample config/assets.yml

```yaml
s3:
    key: foo
    secret: bar
    bucket: baz

javascripts:
    app:
        - public/javascripts/_vendor/plugins.js
        - public/javascripts/_vendor/jquery.tmpl.min.js
        - public/javascripts/_vendor/json2.js
        - public/javascripts/_vendor/underscore-min.js
        - public/javascripts/_vendor/backbone-min.js
        - public/javascripts/app.js
        - public/javascripts/views/hello-world.js
        - public/templates/hello-world.jst
        
    modernizr:
        - public/javascripts/_vendor/modernizr-2.5.3.min.js

stylesheets:
    app:
        - public/stylesheets/_vendor/boilerplate-min.css
        - public/stylesheets/site.css
```

sample express 2.x
==================
Minimus supports Express 2.x apps through helpers.

```javascript

// inside app.configure

minimus = minimus({
    useMinified: false,
    yamlFilePath: __dirname + '/config/assets.yml'
});

...

//
// helpers
//

app.dynamicHelpers ({
    javascripts: function (req, res) {
        return function (name) {
            return minimus.javascripts(name);
        }
    },
    stylesheets: function (req, res) {
        return function (name) {
            return minimus.stylesheets(name);
        }
    },
    env: function (req, res) {
        return function () {
            return settings.env;
        }
    }
});
```

In the layout file:

```html
<%- stylesheets('app') %>
<%- javascripts('modernizr') %>

...
<%- javascripts('app') %>
```

express 3.x
===========
Minimus supports Express 3.x apps through middleware triggered by a special flag:

```javascript

// inside app.configure

minimus = minimus({
    assetsFile: __dirname + '/config/assets.yml',
    debug:      false,
    express3:   true,
    minify:     false    
});


app.use(minimus);
