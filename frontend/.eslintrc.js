/* global module */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
  ],
  env: {
    browser: true
  },
  globals: {
    'BoxSelect': true,
    'ColorThief': true,
    'Stripe': true,
    'deparam': true,
    'google': true,
    'superUser': true,
    'md5': true
  },
  rules: {
    'ember-suave/no-direct-property-access': 'off',
    'ember-suave/prefer-destructuring': 'off',
    'ember-suave/require-access-in-comments': 'off',
    'ember-suave/require-const-for-ember-properties': 'off',
    'generator-star-spacing': ['error', 'neither'],
    'no-constant-condition': ['error', { 'checkLoops': false }],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': "^_" }],
    'one-var': 'off',
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }]
  }
};
