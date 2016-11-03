(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const env = require('./env');

  const pluginDir = path.join('app', 'plugins');
  const getPluginList = function() {
    return jetpack.list(pluginDir);
  };

  const loadPlugin = function(name, callback) {
    const dir = path.join(pluginDir, name);
    if (jetpack.exists(dir) !== 'dir') {
      return callback(new Error('Plugin not found'));
    }
    const manifestFile = path.join(dir, env.pluginManifest);
    if (jetpack.exists(manifestFile) !== 'file') {
      return callback(new Error('Manifest file not found'));
    }
    let manifest = {};
    try {
      manifest = JSON.parse(
        jetpack.read(manifestFile)
      );
    } catch (e) {
      return callback(e);
    }
    callback(null, manifest);
  };

  module.exports = {
    getPluginList: getPluginList,
    loadPlugin: loadPlugin,
  };

})();
