(function() {


  const { BrowserWindow } = require('electron');


  let mainWindow = {};


  const createWindow = function() {
    const { screen } = require('electron');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
      show: true,
      width: width,
      height: height,
    });
    mainWindow.loadURL('file://' + __dirname + '/../html/index.html');
    if (Relief.env.name === 'development') {
      mainWindow.openDevTools();
    }    return mainWindow;
  };


  const refocus = function() {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
  };


  Relief.on('loadingComplete', function() {
    mainWindow.show();
  });


  module.exports = {
    createWindow: createWindow,
    refocus: refocus,
  };

})();
