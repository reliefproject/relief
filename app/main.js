const { app } = require('electron');

const env = require('./lib/env');
const log = require('./lib/log');
const { createWindow } = require('./lib/window');

app.on('ready', function() {
  const mainWindow = createWindow();
});

app.on('window-all-closed', function() {
  app.quit();
});

log.info('Starting application...');
log.info('Version: ', env.version);
