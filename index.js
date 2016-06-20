/* jshint node: true */
'use strict';

var StyleLinter = require('broccoli-style-lint');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-cli-style-lint',

  included: function(app) {
    if (!app.isTestingStyleLintAddon) {
      this._super.included(app);
    }

    this.app = app;
    this.styleLintOptions = app.options.styleLint || {generateTests:true};
  },

  lintTree: function(type, tree) {
    if (type === 'app') {
      return new StyleLinter(this.app.trees.styles, this.styleLintOptions);
    } else {
      return tree;
    }
  }
};
