//eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ...expoConfig,
    settings: {
      'import/resolver': {
        'babel-module': {},
      },
    },
    ignores: ['dist/*'],
  },
]);
