const { app, Menu } = require('electron');
const env = require('./env');
const i18n = require('./i18n');


const setMenu = function(lang) {
  i18n.loadStrings(lang, 'menu').then(strings => {
    const template = [];
    let windowMenu = {
      label: strings.WINDOW,
      role: 'window',
      submenu: [
        {
          label: strings.NEXTTAB,
          accelerator: 'CmdOrCtrl+Tab',
          click: () => {
            Relief.emit('webview.switchToNext');
          },
        },
        {
          label: strings.MINIMIZE,
          role: 'minimize',
        },
        {
          label: strings.CLOSETAB,
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            Relief.emit('webview.close');
          },
        },
        {
          label: strings.CLOSE,
          accelerator: 'CmdOrCtrl+Q',
          role: 'close',
        },
      ],
    };

    for (let i = 1; i < 10; i++) {
      windowMenu.submenu.push({
        accelerator: 'CmdOrCtrl+' + i,
        visible: false,
        click: () => {
          Relief.emit('webview.jumpTo', i);
        },
      });
    }

    template.push(windowMenu);

    template.push({
      label: strings.VIEW,
      submenu: [
        {
          label: strings.RELOAD,
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            Relief.emit('webview.reload');
          },
        },
        {
          type: 'separator',
        },
        {
          label: strings.RESETZOOM,
          role: 'resetzoom',
        },
        {
          label: strings.ZOOMIN,
          role: 'zoomin',
        },
        {
          label: strings.ZOOMOUT,
          role: 'zoomout',
        },
        {
          type: 'separator',
        },
        {
          label: strings.FULLSCREEN,
          role: 'togglefullscreen',
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
            click: (item, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.webContents.toggleDevTools();
              }
            },
          },
          {
            label: strings.DEVTOOLS_PAGE,
            accelerator: 'F12',
            click: () => {
              Relief.emit('webview.devtools');
            },
          },
        ],
      });
    }
    template.push({
      label: strings.HELP,
      role: 'help',
      submenu: [
        {
          label: strings.ABOUT,
        },
        {
          label: strings.DOCUMENTATION,
        },
        {
          label: strings.FORUM,
        },
        {
          label: strings.ISSUES,
        },
      ],
    });

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  });
};


const init = () => {
  return setMenu(env.defaultLanguage);
};


Relief.on('languageChanged', setMenu);


module.exports = {
  init,
};
