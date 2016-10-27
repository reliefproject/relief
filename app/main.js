const { app } = require('electron');
const { createWindow } = require('./lib/window');

app.on('ready', function() {
  const mainWindow = createWindow();
});

app.on('window-all-closed', function() {
  app.quit();
});
