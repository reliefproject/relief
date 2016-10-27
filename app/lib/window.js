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
  mainWindow.loadURL('file://' + __dirname + '/app/html/app.html');
  return mainWindow;
};

// If (Relief.env.name === 'development') {
//  mainWindow.openDevTools();
// }

module.exports = {
  createWindow: createWindow,
};
