const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
  {
    label: 'unit',
    files: 'out/test/**/*.test.js',
    workspaceFolder: '.',
    mocha: {
      ui: 'tdd',
      timeout: 10000
    }
  },
  {
    label: 'smoke',
    files: 'out/test/smoke.test.js',
    workspaceFolder: '.',
    mocha: {
      ui: 'tdd',
      timeout: 10000
    }
  }
]);
