(function() {


  const { app, Menu } = require('electron');
  const env = require('./env');
  const i18n = require('./i18n');


  const setMenu = function(lang) {
    i18n.loadStrings(lang, 'menu')
    .then(function(strings) {
      const template = [];
      template.push({
        label: strings.WINDOW,
        role: 'window',
        submenu: [
          {
            label: strings.MINIMIZE,
            role: 'minimize'
          },
          {
            label: strings.CLOSE,
            accelerator: 'CmdOrCtrl+Q',
            role: 'close'
          },
          {
            label: strings.CLOSETAB,
            accelerator: 'CmdOrCtrl+W',
            click: function(item, focusedWindow) {
              Relief.emit('webview.close');
            },
          },
        ],
      });
      template.push({
        label: strings.VIEW,
        submenu: [
          {
            label: strings.RELOAD,
            accelerator: 'CmdOrCtrl+R',
            click (item, focusedWindow) {
              Relief.emit('webview.reload');
            }
          },
          {
            type: 'separator'
          },
          {
            label: strings.RESETZOOM,
            role: 'resetzoom'
          },
          {
            label: strings.ZOOMIN,
            role: 'zoomin'
          },
          {
            label: strings.ZOOMOUT,
            role: 'zoomout'
          },
          {
            type: 'separator'
          },
          {
            label: strings.FULLSCREEN,
            role: 'togglefullscreen'
          },
        ],
      });
      if (env.name !== 'production') {
        template.push({
          label: strings.DEVELOPMENT,
          submenu: [
            {
              label: strings.DEVTOOLS,
              accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
              click (item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
              }
            },
            {
              label: strings.DEVTOOLS_PAGE,
              accelerator: 'F12',
              click: function(item, focusedWindow) {
                Relief.emit('webview.devtools');
              },
            }
          ],
        });
      }
      template.push({
        label: strings.HELP,
        role: 'help',
        submenu: [
          {
            label: strings.ABOUT
          },
          {
            label: strings.DOCUMENTATION
          },
          {
            label: strings.FORUM
          },
          {
            label: strings.ISSUES
          },
        ],
      });

      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    });
  };


  const init = function() {
    return setMenu(env.defaultLanguage);
  };


  Relief.on('languageChanged', setMenu);


  module.exports = {
    init: init,
  };


})();
