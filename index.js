/* jshint node: true */
'use strict';

var StyleLinter = require('broccoli-stylelint');

module.exports = {
  name: 'ember-cli-stylelint',

  included: function(app) {
    if (!app.isTestingStyleLintAddon) {
      this._super.included(app);
    }

    this.app = app;
    this.styleLintOptions = app.options.styleLint || {generateTests:true};
  },

  lintTree: function(type, tree) {
    var project = this.project;

    if (type === 'app') {
      this.styleLintOptions.testGenerator =  function(relativePath, errors) {
        var passed = null;
        var name = relativePath+' should pass style lint';
        if (errors) {
          passed = false;
          var assertions = [name];
          for(var i = 0; i < errors.warnings.length; i++){
            var warning = errors.warnings[i];
            assertions.push(this.escapeErrorString('line: '+warning.line+', col: '+warning.column+' '+warning.text+'.'));
          }
          errors = assertions.join('\\n');
        } else {
          passed = true;
          errors = "";
        }

        return project.generateTestFile(' Style Lint ', [{
          name: name,
          passed: !!passed,
          errorMessage: errors
        }]);
      };
      return new StyleLinter(this.app.trees.styles, this.styleLintOptions);
    } else {
      return tree;
    }
  }
};
