'use strict';

var mergeTrees = require('broccoli-merge-trees');
var StyleLinter = require('broccoli-stylelint');
var Funnel = require('broccoli-funnel');
const escapeString = require('js-string-escape');

module.exports = {
  name: 'ember-cli-stylelint',

  included: function() {
    //shared
    //guard see https://github.com/ember-cli/ember-cli/issues/3718
    var app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
     app = this._findHost();
    } else {
     // Otherwise, we'll use this implementation borrowed from the _findHost()
     // method in ember-cli.
     var current = this;
     do {
       app = current.app || app;
     } while (current.parent.parent && (current = current.parent));
    }
    this.styleLintOptions = app.options.stylelint || {};
    this.styleLintOptions.console = console;

    //used in real app only
    if (!app.isTestingStyleLintAddon) {
      this._super.included(app);
    } else {
      //Testing only
      this.project = {
        generateTestFile: function(){}
      }
    }

    this.app = app;
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
            assertions.push(escapeString('line: '+warning.line+', col: '+warning.column+' '+warning.text+'.'));
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

      var toBeLinted = [ this.app.trees.app ];
      if (this.styleLintOptions.includePaths) {
        toBeLinted.push.apply(toBeLinted, this.styleLintOptions.includePaths);
      }

      var linted = toBeLinted.map(function(tree) {
        var filteredTreeToBeLinted = new Funnel(tree, {
          exclude: ['**/*.js']
        });
        return StyleLinter.create(filteredTreeToBeLinted, this.styleLintOptions)
      }, this);

      return mergeTrees(linted);
    }
  }
};
