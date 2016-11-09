(function() {

  const EventEmitter = require('events').EventEmitter;
  const { app } = require('electron');

  global.Relief = new EventEmitter();

  const env = require('./lib/env');
  const log = require('./lib/log');
  const window = require('./lib/window');
  const persistence = require('./lib/persistence/persistence');
  const blockchain = require('./lib/blockchain/blockchain');

  app.on('ready', function() {

    log.info('Starting application...');
    log.info('Environment: ', env.name);
    log.info('Version: ', env.version);

    persistence.init()
    .then(blockchain.init)
    .then(window.createWindow, function(err) {
      log.error(err);
      process.exit();
    });
  });

  app.on('window-all-closed', function() {
    app.quit();
  });

}());
