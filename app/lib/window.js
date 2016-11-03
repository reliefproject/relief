(function() {

  const { BrowserWindow } = require('electron');

  let mainWindow = {};

  const createWindow = function() {
    const { screen } = require('electron');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
      show: false,
      width: width,
      height: height,
    });
    mainWindow.loadURL('file://' + __dirname + '/../html/index.html');
    return mainWindow;
  };

  // If (Relief.env.name === 'development') {
  //  mainWindow.openDevTools();
  // }

  module.exports = {
    createWindow: createWindow,
  };

})();
