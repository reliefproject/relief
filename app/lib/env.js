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
   *   - Common  /path/to/userData/commonDir
   *
   * Production (standalone):
   *   - Config  /path/to/Relief_executable
   *   - Data    /path/to/Relief_executable/resources/dbDir
   *   - Plugins /path/to/Relief_executable/resources/pluginDir
   *   - Common  /path/to/Relief_executable/resources/commonDir
   *
   * Development:
   *   - Config  /path/to/userData_development
   *   - Data    /path/to/userData_development/dbDir
   *   - Plugins /path/to/userData_development/pluginDir
   *   - Common  /path/to/userData_development/commonDir
   *
   * Development (standalone):
   *   - Config  /path/to/Relief
   *   - Data    /path/to/Relief/dbDir
   *   - Plugins /path/to/Relief/pluginDir
   *   - Common  /path/to/Relief/commonDir
  */
  env.getPath = function(name, standalone) {
    switch(name) {
      // Path to config
      case 'config': {
        if (!standalone) {
          return app.getPath('userData');
        }
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
      // Path to local config (standalone mode)
      case 'config_local': {
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
      // Path to plugins
      case 'plugin': {
        if (!standalone) {
          return path.join(
            app.getPath('userData'),
            env.commonDir
          );
        }
        return path.join(
          app.getAppPath(),
          env.commonDir
        );
      }
    }
  };


  let localConf = {};
  let conf = {};
  // Load local config
  let file = path.join(
    env.getPath('config', true),
    env.configFilename
  );
  let exists = jetpack.exists(file);
  if (exists) {
    localConf = jetpack.read(file, 'json');
  }
  // Load global config
  file = path.join(
    env.getPath('config'),
    env.configFilename
  );
  exists = jetpack.exists(file);
  if (exists) {
    conf = jetpack.read(file, 'json');
  }
  // Local settings have precedence
  Object.assign(conf, localConf);
  Object.assign(env, conf);


  // Copy default plugins to userData folder
  if (!env.standalone) {
    for (let i in env.defaultPlugins) {
      const plg = env.defaultPlugins[i];
      const path = path.join(
        env.getPath('plugin', true),
        plg
      );
      jetpack.copy(path, env.getPath('plugin'));
    }
    jetpack.copy(
      env.getPath('common', true),
      env.getPath('common')
    );
  }


  module.exports = env;


})();
