minimus
=======

Asset bundler and deployer for node and S3


current state
=============
The initial seed is a fully working module from a production app.  The code is not an npm package, doesn't have unit tests, and has a lot of hard coding going on.  It does load assets from yaml uncompressed in dev, minified in prod, and uses jammit to bundle assets and then pushes them to S3.
