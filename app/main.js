const { app } = require('electron');


const EventEmitter = require('eventemitter2').EventEmitter2;
global.Relief = new EventEmitter({ wildcard: true });


const env = require('./lib/env');
const log = require('./lib/log');
const menu = require('./lib/menu');
const window = require('./lib/window');
const persistence = require('./lib/persistence/persistence');
const blockchain = require('./lib/blockchain/blockchain');


// Someone tried to run a second instance, we should focus our window.
const shouldQuit = app.makeSingleInstance(window.refocus);
if (shouldQuit) {
  log.info('Another instance already running. Exiting.');
  app.quit();
}


app.on('ready', () => {

  log.info('Relief', env.version);
  log.info('Environment', env.name);

  persistence.init();
  blockchain.init();
  menu.init();
  window.createWindow();

});


app.on('window-all-closed', () => {
  log.info('All windows closed. Exiting.')
  app.quit();
});


Relief.onAny((event, value) => {
  log.debug({
    event: event,
    value: value,
  });
});
