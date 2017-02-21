/* global require, describe, beforeEach, afterEach, it */
var broccoli = require('broccoli');
var chai = require('chai');
var linter = require('..');

var assert = chai.assert;

var builder, errors;

function buildAndLint(sourcePath, options) {
  var defaultOptions = {
    onError: function(results) {
      errors.push(results);
    },
    console: console
  };

  linter.included({
    isTestingStyleLintAddon: true,
    options: {
      stylelint: Object.assign({}, defaultOptions, options)
    },
    trees: {
      app: sourcePath, // Directory to lint
    }
  });

  var node = linter.lintTree('app', {
    tree: sourcePath
  });

  builder = new broccoli.Builder(node);

  return builder.build();
}

describe('ember-cli-stylelint', function() {
  beforeEach(function() {
    errors = [];
  });

  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('The linter should run', function() {
    return buildAndLint('tests/dummy').then(function() {
      var firstError = errors[0];
      var secondError = errors[1];

      assert.ok(!!firstError,
        'The linting should occur');
      assert.ok(!!secondError,
        'The linting should occur');

      assert.equal(firstError.source, 'app/styles/app.scss',
        'The app.scss file should be linted');
      assert.equal(secondError.source, 'app/styles/some_module/index.scss',
        'The some_module/index.scss file should be linted');

      assert.ok(firstError.warnings.length === 2,
        'Found correct amount of errors');
      assert.ok(secondError.warnings.length === 1,
        'Found correct amount of errors');
    });
  });

  it('should not include app tree by default if includeAppTree is false', function() {
    var options = {
      includeAppTree: false,
      includePaths: [ 'tests/dummy/app/styles/some_module' ]
    };
    return buildAndLint('tests/dummy', options)
      .then(function() {
        var firstError = errors[0];

        assert.ok(!!firstError,
          'The linting should occur');

        assert.equal(firstError.source, 'index.scss',
          'The app.scss file should not be linted');

        assert.equal(firstError.warnings.length, 1,
          'Found correct amount of errors');
      });
  });
});
