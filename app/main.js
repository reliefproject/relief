(function() {'use strict';

  const { app } = require('electron');

  global.Relief = {
    env: require('./lib/env'),
    log: require('./lib/log'),
    i18n: require('./lib/i18n'),
    window: require('./lib/window'),
    plugin: require('./lib/plugin'),
    passphrase: require('./lib/crypto/passphrase'),
    persistence: require('./lib/persistence/persistence'),
    get blockchain() {
      return require('./lib/blockchain/blockchain')(Relief);
    },
    get user() {
      return require('./lib/user')(Relief);
    },
  };

  app.on('ready', function() {
    const mainWindow = Relief.window.createWindow();
  });

  app.on('window-all-closed', function() {
    app.quit();
  });

  Relief.log.info('Starting application...');
  Relief.log.info('Version: ', Relief.env.version);

  const onPersistenceInit = function(err) {
    if (err) {
      Relief.log.error(err);
      process.exit();
    }
    Relief.blockchain.init(onBlockchainInit);
  };

  const onBlockchainInit = function(err) {
    if (err) {
      Relief.log.error(err);
    }
  };

  Relief.persistence.init(onPersistenceInit);

}());
