/* jshint node: true */
'use strict';

var mergeTrees = require('broccoli-merge-trees');
var StyleLinter = require('broccoli-stylelint');

module.exports = {
  name: 'ember-cli-stylelint',

  included: function(app) {
    this.styleLintOptions = app.options.stylelint || {};
    this.styleLintOptions.console = console;
  },

  lintTree: function(type, tree) {
    var project = this.project;
    if (type === 'templates') {
      return undefined;
    }

    this.styleLintOptions.testGenerator =  function(relativePath, errors) {
      var passed = null;
      var name = relativePath+' should pass style lint';
      if (errors) {
        passed = false;
        var assertions = [name];
        for(var i = 0; i < errors.warnings.length; i++){
          var warning = errors.warnings[i];
          var warningMessage = 'line: ' + warning.line + ', col: ' + warning.column + ' ' + warning.text + '.';
          assertions.push(this.escapeErrorString(warningMessage));
        }
        errors = assertions.join('\\n');
      } else {
        passed = true;
        errors = '';
      }

      return project.generateTestFile(' Style Lint ', [{
        name: name,
        passed: !!passed,
        errorMessage: errors
      }]);
    };

    var toBeLinted = [ this.app.trees.styles ];
    if (this.styleLintOptions.includePaths) {
      toBeLinted.push.apply(toBeLinted, this.styleLintOptions.includePaths);
    }
    var linted = toBeLinted.map(function(tree) {
      return new StyleLinter(tree, this.styleLintOptions);
    }, this);
    return mergeTrees(linted);
  }
};
