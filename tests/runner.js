/* global require, describe, beforeEach, afterEach, it */
var broccoli = require('broccoli');
var chai = require('chai');
var linter = require('..');

var assert = chai.assert;

var builder, errors;

function buildAndLint(sourcePath) {
  linter.included({
    isTestingStyleLintAddon: true,
    options: {
      styleLint:{
        onError: function(results) {
          errors.push(results);
        },
        generateTests:true
      }
    },
    trees: {
      styles: sourcePath, // Directory to lint
    },
  });

  var node = linter.lintTree('app', {
    tree: sourcePath
  });

  builder = new broccoli.Builder(node);

  return builder.build();
}

describe('ember-cli-style-lint', function() {
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

      assert.ok(!!firstError,
        'The linting should occur');

      assert.equal(firstError.source, 'app/styles/app.scss',
        'The app.scss file should be linted');

      assert.ok(firstError.warnings.length === 2,
        'Found correct amount of errors');
    });
  });
});
