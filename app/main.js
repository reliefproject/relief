(function() {'use strict';

  const EventEmitter = require('events').EventEmitter;
  const { app } = require('electron');

  global.Relief = new EventEmitter();

  const env = require('./lib/env');
  const log = require('./lib/log');
  const window = require('./lib/window');
  const persistence = require('./lib/persistence/persistence');
  const blockchain = require('./lib/blockchain/blockchain');

  /*  Global.Relief = {
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
*/
  app.on('ready', function() {

    log.info('Starting application...');
    log.info('Environment: ', env.name);
    log.info('Version: ', env.version);

    const onPersistenceInit = function(err) {
      if (err) {
        log.error(err);
        process.exit();
      }
      blockchain.init(function() {
        const mainWindow = window.createWindow();
        //Relief.on('loadingComplete', function() {
        mainWindow.show();
        //});
      });
    };

    persistence.init(onPersistenceInit);
  });

  app.on('window-all-closed', function() {
    app.quit();
  });

}());
