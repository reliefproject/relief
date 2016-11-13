(function() {

  const EventEmitter = require('events').EventEmitter;
  const { app } = require('electron');
  const jetpack = require('fs-jetpack');

  global.Relief = new EventEmitter();

  const env = require('./lib/env');
  const log = require('./lib/log');
  const window = require('./lib/window');
  const persistence = require('./lib/persistence/persistence');
  const blockchain = require('./lib/blockchain/blockchain');

  // Someone tried to run a second instance, we should focus our window.
  const shouldQuit = app.makeSingleInstance(window.refocus);
  if (shouldQuit) {
    log.info('Another instance already running. Exiting.');
    app.quit();
  }

  app.on('ready', function() {

    log.info('Relief', env.version);
    log.info('Environment', env.name);

    persistence.init()
    .then(blockchain.init)
    .then(window.createWindow, function(err) {
      log.error(err);
      process.exit();
    });
  });

  app.on('window-all-closed', function() {
    log.info('All windows closed. Exiting.')
    app.quit();
  });

}());
