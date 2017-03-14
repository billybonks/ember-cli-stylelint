module.exports = {
  description: 'creates a default .stylintrc',
  normalizeEntityName: function() {
    return '';
  },

  afterInstall: function() {
    return this.addPackageToProject('stylelint-config-standard', 'latest');
  }
};
