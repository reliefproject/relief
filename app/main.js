const { app } = require('electron');

const env = require('./lib/env');
const log = require('./lib/log');
const { createWindow } = require('./lib/window');
const persistence = require('./lib/persistence/persistence');
const blockchain = require('./lib/blockchain/blockchain');
const user = require('./lib/user')

app.on('ready', function() {
  const mainWindow = createWindow();
});

app.on('window-all-closed', function() {
  app.quit();
});

log.info('Starting application...');
log.info('Version: ', env.version);

global.Relief = {};

const onPersistenceInit = function(err) {
  if (err) {
    log.error(err);
    process.exit();
  }
  global.Relief.db = persistence.db;
  global.Relief.user = user;
  blockchain.init(onBlockchainInit);
};

const onBlockchainInit = function(err) {
  if (err) {
    log.error(err);
    process.exit();
  }
  global.Relief.bc = blockchain.bc;
};

persistence.init(onPersistenceInit);
