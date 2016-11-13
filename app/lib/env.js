(function() {


  const path = require('path');
  const { app } = require('electron');
  const jetpack = require('fs-jetpack');


  // The variables have been written to `env.json` by the build process.
  let env = jetpack.cwd(__dirname).read('../env.json', 'json');


  // Save userData in separate folders for each environment.
  if (env.name !== 'production') {
      let userDataPath = app.getPath('userData');
      app.setPath('userData', userDataPath + '_' + env.name);
  }


  /**
   * App uses the following directories:
   *
   * Production:
   *   - Config  /path/to/userData
   *   - Data    /path/to/userData/dbDir
   *   - Plugins /path/to/userData/pluginDir
   *
   * Production (standalone):
   *   - Config  /path/to/Relief_executable
   *   - Data    /path/to/Relief_executable/resources/dbDir
   *   - Plugins /path/to/Relief_executable/resources/pluginDir
   *
   * Development:
   *   - Config  /path/to/userData_development
   *   - Data    /path/to/userData_development/dbDir
   *   - Plugins /path/to/userData_development/pluginDir
   *
   * Development (standalone):
   *   - Config  /path/to/Relief
   *   - Data    /path/to/Relief/dbDir
   *   - Plugins /path/to/Relief/pluginDir
  */
  env.getPath = function(name, standalone) {
    switch(name) {
      // Path to config
      case 'config': {
        return app.getPath('userData');
      }
      // Path to local config (standalone mode)
      case 'config_local': {
        if (env.name !== 'production') {
          const appPath = app.getAppPath();
          const rootPath = path.join(appPath, '..');
          return path.normalize(rootPath);
        }
        const exePath = path.parse(
          app.getPath('exe')
        );
        return exePath.dir;
      }
      // Path to data dir (persistence)
      case 'data': {
        if (!standalone) {
          return path.join(
            app.getPath('userData'),
            env.dbDir
          );
        }
        const appPath = app.getAppPath();
        const rootPath = path.join(appPath, '..', env.dbDir);
        return path.normalize(rootPath);
      }
      // Path to plugins
      case 'plugin': {
        if (!standalone) {
          return path.join(
            app.getPath('userData'),
            env.pluginDir
          );
        }
        return path.join(
          app.getAppPath(),
          env.pluginDir
        );
      }
    }
  };


  let localConf = {};
  let conf = {};
  // Load local config
  let file = env.getPath('config', true);
  let exists = jetpack.exists(file);
  if (exists) {
    localConf = jetpack.read(file, 'json');
  }
  // Load global config
  file = env.getPath('config');
  exists = jetpack.exists(file);
  if (exists) {
    conf = jetpack.read(file, 'json');
  }
  // Local settings have precedence
  Object.assign(conf, localConf);
  Object.assign(env, conf);

/*
console.log(env.getPath('config', false));
console.log(env.getPath('config', true));
console.log(env.getPath('config_local', false));
console.log(env.getPath('config_local', true));
console.log(env.getPath('data', false));
console.log(env.getPath('data', true));
console.log(env.getPath('plugin', false));
console.log(env.getPath('plugin', true));
*/


  module.exports = env;


})();
