/* global require, module */
/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  console.log('Starting Ember build with Node version:', process.version);
  console.log('Build environment:', process.env.EMBER_ENV);
  
  let app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
      throwUnlessParallelizable: false,
      debug: true
    },
    eslint: {
      testGenerator: 'qunit',
      group: true
    },
    'ember-cli-uglify': {
      uglify: {
        compress: false
      }
    },
    ace: {
      themes: ['github'],
      modes: ['javascript']
    },
    sassOptions: {
      implementation: require('sass')
    },
    autoRun: true,
    storeConfigInMeta: false,
    fingerprint: {
      enabled: false
    },
    verbose: true,
    sourcemaps: {
      enabled: false
    },
    autoImport: {
      forbidEval: false,
      webpack: {
        externals: {
          'require': 'require',
          'define': 'define'
        },
        output: {
          libraryTarget: 'umd',
          globalObject: 'this'
        },
        resolve: {
          fallback: {
            "path": false,
            "fs": false
          }
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
          ]
        }
      }
    }
  });

  app.import('vendor/bootstrap/dropdown/bootstrap-dropdown.js');
  app.import('vendor/bootstrap/tab/bootstrap-tab.js');
  app.import('vendor/bootstrap/tooltip/bootstrap-tooltip.js');
  app.import('vendor/bootstrap/popover/bootstrap-popover.js');
  app.import('vendor/wildnote/wildnote-helper-list.js');
  app.import('vendor/rails-ujs-handlers.js');
  
  console.log('EmberApp configuration complete');
  return app.toTree();
};
