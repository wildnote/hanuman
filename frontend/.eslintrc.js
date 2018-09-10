module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: ['ember', 'prettier'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'prettier'],
  env: {
    browser: true,
    es6: true
  },
  globals: {
    BoxSelect: true,
    ColorThief: true,
    Stripe: true,
    deparam: true,
    google: true,
    superUser: true,
    md5: true
  },
  rules: {
    'generator-star-spacing': ['error', 'neither'],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'one-var': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
    quotes: ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }]
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};
