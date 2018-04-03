'use strict';

let mergeTrees = require('broccoli-merge-trees');
let StyleLinter = require('broccoli-stylelint');
let Funnel = require('broccoli-funnel');
const escapeString = require('js-string-escape');

module.exports = {
  name: 'ember-cli-stylelint',

  init(){
    this._super.init && this._super.init.apply(this, arguments);

    let VersionChecker = require('ember-cli-version-checker');
    let checker = new VersionChecker(this);

    if (checker.for('ember-qunit', 'npm').exists() || checker.for('ember-cli-qunit', 'npm').exists()) {
      this._testGenerator = 'qunit';
    } else if (checker.for('ember-mocha', 'npm').exists() || checker.for('ember-cli-mocha', 'npm').exists()) {
      this._testGenerator = 'mocha';
    }
  },

  included() {
    //shared
    //guard see https://github.com/ember-cli/ember-cli/issues/3718
    let app;

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
     app = this._findHost();
    } else {
     // Otherwise, we'll use this implementation borrowed from the _findHost()
     // method in ember-cli.
     let current = this;
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

  lintTree() {
    if (!this.linted) {
      this.styleLintOptions.testingFramework = this._testGenerator;

      let toBeLinted = [ this.app.trees.app ];
      if (this.styleLintOptions.includePaths) {
        toBeLinted.push.apply(toBeLinted, this.styleLintOptions.includePaths);
      }

      let linted = toBeLinted.map(function(tree) {
        let filteredTreeToBeLinted = new Funnel(tree, {
          exclude: ['**/*.js']
        });
        return StyleLinter.create(filteredTreeToBeLinted, this.styleLintOptions)
      }, this);
      this.linted = true;
      return mergeTrees(linted);
    }
  }
};
