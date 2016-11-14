(function() {


  const path = require('path');
  const { app } = require('electron');
  const jetpack = require('fs-jetpack');


  // The variables have been written to file by the build process.
  let env = jetpack.cwd(__dirname)
  .read('../config/defaults.json', 'json');


  // Save userData in separate folders for each environment.
  if (env.name !== 'production') {
      let userDataPath = app.getPath('userData');
      app.setPath('userData', userDataPath + '_' + env.name);
  }


  env.getPath = function(name, standalone) {
    const rootPath = standalone
      ? app.getAppPath()
      : app.getPath('userData');
    switch(name) {
      case 'config': {
        return path.join(rootPath, env.configDir);
      }
      case 'data': {
        return path.join(rootPath, env.dbDir);
      }
      case 'plugin': {
        return env.name === 'test'
          ? path.join(__dirname, '..', env.pluginDir)
          : path.join(rootPath, env.pluginDir);
      }
      case 'common': {
        return env.name === 'test'
          ? path.join(__dirname, '..', env.commonDir)
          : path.join(rootPath, env.commonDir);
      }
    }
  };


  const conf = {};
  const file = path.join(
    env.getPath('config', env.standalone),
    env.configFilename
  );
  if (jetpack.exists(file)) {
    conf = jetpack.read(file, 'json');
  }
  Object.assign(env, conf);


  // Copy default plugins to userData folder
  if (!env.standalone) {
    for (let i in env.defaultPlugins) {
      const plugin = env.defaultPlugins[i];
      const pluginPath = path.join(
        env.getPath('plugin', true),
        plugin
      );
      const pluginDest = path.join(
        env.getPath('plugin'),
        plugin
      );
      jetpack.copy(
        pluginPath,
        pluginDest,
        { overwrite: true }
      );
    }
    jetpack.copy(
      env.getPath('common', true),
      env.getPath('common'),
      { overwrite: true }
    );
  }


  module.exports = env;


})();
