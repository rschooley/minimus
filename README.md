# Minimus
Asset bundler and deployer for node and S3.


## Install
Minimus is currently not available through npm.  

The project can be loaded by adding the following to your package.json file:

```javascript
{
    ....
    "minimus": "git+https://github.com/rschooley/minimus.git#cleanup",
    ...
}
```

## Configuring
The minimus module should be laoded in your primary node app file (app.js, web.js, server.js, etc).

```javascript
var minimus = require('minimus');

var assets = minimus({
    assetsFile:     __dirname + '/config/assets.yml',   // path to asset file (below)
    minify:         false                               // pass in boolean based on NODE_ENV
});
```

and then added as middleware in configure.

```javascript
app.configure(function () {
    ...
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    
    app.use(assets);
    
    app.use(app.router);
    ...
});
```

## Asset File

```yml
s3:             # where css, js, and jst will be minified and deployed when ```minify: true```
    key: foo
    secret: bar
    bucket: baz

javascripts:
    modernizr:
        - public/javascripts/_vendor/modernizr.min.js

    common:
        # core
        - public/javascripts/_vendor/plugins.js
        - public/javascripts/_vendor/bootstrap-min.js

        # views
        - public/javascripts/views/foos/super-special-view.js
        - public/javascripts/views/foos/*
        - public/javascripts/views/bars/*

        # templates
        - public/templates/foos/*
        - public/templates/bars/*

stylesheets:
    common:
        - public/stylesheets/_vendor/*
        - public/stylesheets/site.css

```

## Wilcards
Please note only one level of wildcard mapping is supported.

```yml
- public/javascripts/views/foos/*       # will match all files in the foos dir
```

Will not work:
```yml
- public/javascripts/views/*            # will match all files in the views dir, not in the child dirs below
```

## Using
In Express 3.x minimus is run as middleware adding the following to ```res.locals```:
```javascript
stylesheets
javascripts
```

These are included in views with a function call:
```html
<%- stylesheets('sectionName') %>
```

where ```sectionName``` is a section from the assets.yml file above.


## Deploying
The following command will read the assets.yml file and deploy to the specified Amazon S3 bucket.

```bash
node_modules/minimus/bin/minimus
```

Setting the ```minify``` option to true in the minimus function will use the specified S3 bucket for the assets.


## Images
Images are not deployed as part of this process; they must be uploaded manually.


## Express 2.x Sample
Minimus supports Express 2.x apps through helpers.

```javascript

// inside app.configure

minimus = minimus({
    express3: false,
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
    }
});
```
