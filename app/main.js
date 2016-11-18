const { app } = require('electron');


const EventEmitter = require('eventemitter2').EventEmitter2;
global.Relief = new EventEmitter({ wildcard: true });


const env = require('./lib/env');
const log = require('./lib/log');
const menu = require('./lib/menu');
const window = require('./lib/window');
const DbManager = require('./lib/db/db_manager');
const Nxt = require('./lib/blockchain/nxt');


// Someone tried to run a second instance, we should focus our window.
const shouldQuit = app.makeSingleInstance(window.refocus);
if (shouldQuit) {
  log.info('Another instance already running. Exiting.');
  app.quit();
}

const db = new DbManager().init('app', {}, true);
const nxt = new Nxt();

app.on('ready', () => {

  log.info('Relief', env.version);
  log.info('Environment', env.name);

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
