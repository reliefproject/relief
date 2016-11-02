(function() {'use strict';

  const events = require('events');
  const { app } = require('electron');

  global.Relief = {
    events: new events.EventEmitter(),
    env: require('./lib/env'),
    log: require('./lib/log'),
    i18n: require('./lib/i18n'),
    window: require('./lib/window'),
    plugin: require('./lib/plugin'),
    passphrase: require('./lib/crypto/passphrase'),
    persistence: require('./lib/persistence/persistence'),
    get user() {
      return require('./lib/user')(Relief);
    },
    get blockchain() {
      return require('./lib/blockchain/blockchain')(Relief);
    },
  };

  app.on('ready', function() {

    Relief.log.info('Starting application...');
    Relief.log.info('Environment: ', Relief.env.name);
    Relief.log.info('Version: ', Relief.env.version);

    const onPersistenceInit = function(err) {
      if (err) {
        Relief.log.error(err);
        process.exit();
      }
      Relief.blockchain.init(function() {
        const mainWindow = Relief.window.createWindow();
        Relief.events.on('loadingComplete', function() {
          mainWindow.show();
        });
      });
    };

    Relief.persistence.init(onPersistenceInit);
  });

  app.on('window-all-closed', function() {
    app.quit();
  });

}());
