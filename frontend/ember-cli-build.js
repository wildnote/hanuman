/* global require, module */
/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
      compileModules: true,
      plugins: [
        require.resolve('babel-plugin-transform-object-rest-spread')
      ]
    },
    eslint: {
      testGenerator: 'qunit',
      group: true
    },
    'ember-cli-uglify': {
      uglify: {
        compress: false // added this to workaround the https://github.com/ember-cli/ember-cli-uglify/issues/35
      }
    },
    ace: {
      themes: ['github'],
      modes: ['javascript']
    },
    sassOptions: {
      includePaths: ['bower_components'],
      implementation: require('sass')
    },
    storeConfigInMeta: false,
    generateAssetMap: true,
  });

  app.import('bower_components/animate.css/animate.min.css');
  app.import('vendor/bootstrap/dropdown/bootstrap-dropdown.js');
  app.import('vendor/bootstrap/tab/bootstrap-tab.js');
  app.import('vendor/bootstrap/tooltip/bootstrap-tooltip.js');
  app.import('vendor/bootstrap/popover/bootstrap-popover.js');
  app.import('vendor/wildnote/wildnote-helper-list.js');
  app.import('vendor/rails-ujs-handlers.js');
  return app.toTree();
};
