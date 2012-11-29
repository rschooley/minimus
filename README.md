minimus
=======

Asset bundler and deployer for node and S3


current state
=============
The initial seed is a fully working module from a production app.  The code is not an npm package, doesn't have unit tests, and has a lot of hard coding going on.  It does load assets from yaml uncompressed in dev (NODE_ENV), minified in prod, and uses jammit to bundle assets and then pushes them to S3.

sample yaml file
================
sample config/assets.yml

s3:
    key: foo
    secret: bar
    bucket: baz

javascripts:
    app-min:
        - public/javascripts/_vendor/plugins.js
        - public/javascripts/_vendor/jquery.tmpl.min.js
        - public/javascripts/_vendor/json2.js
        - public/javascripts/_vendor/underscore-min.js
        - public/javascripts/_vendor/backbone-min.js
        - public/javascripts/app.js
        - public/javascripts/views/hello-world.js
        - public/templates/hello-world.jst
        
    modernizr-min:
        - public/javascripts/_vendor/modernizr-2.5.3.min.js

stylesheets:
    app-min:
        - public/stylesheets/_vendor/boilerplate-min.css
        - public/stylesheets/site.css
