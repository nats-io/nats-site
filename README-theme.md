# Nats.io Theme

This is a [HUGO](https://gohugo.io/) theme that is used for the [NATS  main website](https://github.com/nats-io/nats-site) and the [NATS documentation website](https://github.com/nats-io/nats-docs).

Below you will find directions on how to update the main theme for both of these sites.

## Setup
First you need to install all dependencies with: `npm install`.

Once all dependencies have been installed you can run the `gulp` command to start generating files for use. Gulp will take care of compiling all LESS files and JS into their minified versions ready for use.

## Developing
### CSS
[LESS](http://lesscss.org/) is used for CSS within this theme. In order to add custom CSS, you just need to edit/add to `/src/less/styles.less`. When you save and gulp is running, it will see the changes and recompile the new CSS.

### JS
All JS should be added to the file `/src/js/index.js`, or you may just drop any JS file into the `/src/js/` directory and gulp will automatically combine it into the main JS file.
