const { BrowserWindow, Menu } = require('electron');


let mainWindow = {};


const createWindow = () => {
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


const refocus = () => {
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();
};


Relief.on('loadingComplete', () => mainWindow.show());


module.exports = {
  createWindow,
  refocus,
};
