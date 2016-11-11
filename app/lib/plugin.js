(function() {


  const path = require('path');
  const jetpack = require('fs-jetpack');
  const nxtpm = require('nxtpm');
  const env = require('./env');
  const pluginDir = path.join('app', 'plugins');


  const getPluginList = function() {
    return jetpack.list(pluginDir);
  };


  const loadPlugin = function(name) {
    const dir = path.join(pluginDir, name);
    if (jetpack.exists(dir) !== 'dir') {
      throw new Error('Plugin not found');
    }
    const manifestFile = path.join(dir, env.pluginManifest);
    if (jetpack.exists(manifestFile) !== 'file') {
      throw new Error('Manifest file not found');
    }
    let manifest = {};
    return manifest = JSON.parse(
      jetpack.read(manifestFile)
    );
  };


  const getPackageInfo = function(packageName) {
    return nxtpm.Package.getPackageInfo(packageName);
  };


  const install = function(packageName) {
    return nxtpm.Package.install(packageName, pluginDir);
  };


  module.exports = {
    getPluginList: getPluginList,
    loadPlugin: loadPlugin,
    getPackageInfo: getPackageInfo,
    install: install,
  };

})();
