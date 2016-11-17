const { shell } = require('electron');
const contextMenu = require('electron-context-menu');
const async = require('async');


app.controller(
  'MainCtrl',
  ['$scope', '$sce', 'i18n', 'Notification',
  function($scope, $sce, i18n, Notification) {


    let appData = {};
    $scope.strings = {};
    $scope.appMenu = {};
    $scope.tabs = {};
    $scope.nxtBlockHeight = '';
    $scope.userAgent = Relief.env.appName + ' ' + Relief.env.version;
    $scope.referrer = Relief.env.referrer;
    $scope.notification = {};

    $scope.selectTab = tabId => {
      $scope.selectedTab = tabId;
    };


    $scope.openTab = (tabId, tab, select) => {
      $scope.showAppMenu = false;
      select = select === undefined
        ? true
        : select;
      if (!tab) {
        tab = Relief.plugin.loadPlugin(tabId);
      }
      $scope.tabs[tabId] = tab;
      if (select) {
        $scope.selectTab(tabId)
      }
      updateTabData();
    };


    $scope.closeTab = tabId => {
      const webview = document.getElementById(tabId);
      const showing = angular.element(webview).hasClass('show');
      if (showing) {
        let tabIndex;
        const keys = Object.keys($scope.tabs);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i] === tabId) {
            tabIndex = i;
            break;
          }
        }
        const tabToSelect = keys[tabIndex + 1] !== undefined
          ? tabIndex + 1
          : tabIndex - 1;
        $scope.selectTab(keys[tabToSelect]);
      }
      delete $scope.tabs[tabId];
    };


    $scope.trustUrl = tab => {
      return $sce.trustAsResourceUrl(tab.url);
    };


    $scope.loggedOut = () => {
      $scope.isLoggedIn = false;
      const data = Relief.plugin.loadPlugin('start');
      $scope.tabs = {};
      $scope.tabs['start'] = data;
      $scope.selectedTab = 'start';
      updateTabData();
      $scope.$apply();
    };


    const getTabDisplayTitle = plugin => {
      if (plugin.title !== null && typeof plugin.title === 'object') {
        return plugin.title[appData.language]
          ? plugin.title[appData.language]
          : plugin.title[Relief.env.defaultLanguage];
      }
      return plugin.name;
    };


    const getPluginSrc = plugin => {
      const dir = Relief.env.getPath('plugin', Relief.env.standalone);
      return 'file://' + dir + '/' + plugin.name + '/' + plugin.main;
    }


    const updateTabData = () => {
      for (var k in $scope.tabs) {
        if (!$scope.tabs[k].url) {
          $scope.tabs[k].url = getPluginSrc($scope.tabs[k]);
        }
        if (Relief.env.fixedTabs.indexOf($scope.tabs[k].name) != -1) {
          $scope.tabs[k].fixed = true;
        }
        $scope.tabs[k].displayTitle = getTabDisplayTitle($scope.tabs[k]);
      }
    };


    let notification = Notification.readQueue();
    const workOffNotificationQueue = () => {
      let options;
      async.whilst(
        () => {
          options = notification.next();
          return options.value;
        },
        callback => {
          $scope.notification = options.value;
          $scope.$apply();
          setTimeout(() => {
            $scope.notification.show = false;
            $scope.$apply();
            $scope.notification = {};
            callback();
          },
            (Relief.env.notificationDisplaySeconds * 1000)
          );
        },
        err => {
          if (err) {
            Relief.log.error(err);
          }
          setTimeout(workOffNotificationQueue, 1000);
        }
      );
    };


    Relief.db.app.getDoc().then(doc => {
      appData = doc;
      if (!appData) {
        appData = {
          language: Relief.env.defaultLanguage,
        };
      }
      // First start, we're not logged in
      $scope.loggedOut();
      return i18n.loadStrings(appData.language)
      .then(strings => {
        $scope.strings = strings;
        $scope.$apply();
      })
      .then(workOffNotificationQueue);
    },
      // Error handler
      Relief.log.error
    );


    Relief.on('loggedIn', () => {
      $scope.isLoggedIn = true;
      let newTabs = {
        apps: Relief.plugin.loadPlugin('apps'),
      };
      delete $scope.tabs['start'];
      // New tabs first, in case another tab, e.g. "help" is already open
      const oldTabs = $scope.tabs;
      $scope.tabs = newTabs;
      for (var k in oldTabs) {
        $scope.tabs[k] = oldTabs[k];
      }
      updateTabData();
      $scope.selectTab('apps');
      $scope.$apply();
      Relief.emit('updateAppMenu');
    });


    Relief.on('updateAppMenu', () => {
      Relief.db.user.getDoc()
      .then(function(data) {
        for (let k in data.plugins) {
          const plugin = data.plugins[k];
          if (plugin.showInMenu) {
            const pluginData = Relief.plugin.loadPlugin(k);
            $scope.appMenu[k] = pluginData;
            $scope.appMenu[k].title = getTabDisplayTitle(pluginData);
          }
        }
        $scope.$apply();
      });
    });


    Relief.on('languageChanged', lang => {
      if (lang !== appData.language) {
        appData.language = lang;
        updateTabData();
        i18n.loadStrings(appData.language)
        .then(function(strings) {
          $scope.strings = strings;
          $scope.$apply();
        });
      }
    });


    Relief.on('nxt.BlockHeight', height => {
      $scope.nxtBlockHeight = height;
      $scope.$apply();
    });


    Relief.on('webview.ready', id => {
      contextMenu({
        window: document.getElementById(id),
        showInspectElement: false,
        append: params => {
          return [{
            label: i18n.strings.COPY_IMAGE_URL,
            visible: params.mediaType === 'image',
            click: () => Relief.clipboard.writeText(params.srcURL),
          },
          {
            label: i18n.strings.OPEN_IMAGE,
            visible: params.mediaType === 'image',
            click: () => shell.openExternal(params.srcURL),
          },
          {
            label: i18n.strings.OPEN_LINK,
            visible: params.linkURL !== '',
            click: () => shell.openExternal(params.linkURL),
          },];
        },
        labels: {
          cut: i18n.strings.CUT,
          copy: i18n.strings.COPY,
          paste: i18n.strings.PASTE,
          save: i18n.strings.SAVE_IMAGE,
          copyLink: i18n.strings.COPY_LINK,
        },
      });
    });


    Relief.on('webview.open', plugin => {
      $scope.openTab(plugin);
      $scope.$apply();
    });


    Relief.on('webview.close', () => {
      const tabId = $scope.selectedTab;
      if (!$scope.tabs[tabId].fixed) {
        $scope.closeTab(tabId);
        $scope.$apply();
      }
    });


    Relief.on('webview.reload', () => {
      const webview = document.getElementById(
        $scope.selectedTab
      );
      webview.reload();
    });


    Relief.on('webview.devtools', () => {
      const webview = document.getElementById(
        $scope.selectedTab
      );
      webview.openDevTools();
    });


    Relief.on('webview.switchToNext', () => {
      const keys = Object.keys($scope.tabs);
      if (keys.length === 1) {
        return;
      }
      let tabIndex;
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === $scope.selectedTab) {
          tabIndex = i;
          break;
        }
      }
      const nextIndex = (tabIndex + 1);
      const nextTab = keys[nextIndex]
        ? keys[nextIndex]
        : keys[0];
      $scope.selectTab(nextTab);
      $scope.$apply();
    });


    Relief.on('webview.jumpTo', number => {
      const index = (number - 1);
      const keys = Object.keys($scope.tabs);
      if (!keys[index]) {
        return;
      }
      $scope.selectTab(
        keys[index]
      );
      $scope.$apply();
    });


    Relief.on('notify', options => {
      options.show = true;
      options.locale = appData.language;
      Notification.addToQueue(options);
    });


    Relief.on('notify.dataInconsistency', data => {
      let message = i18n.strings.WARN_INCONST_DATA_NXT;
      message += ' (Hosts: ' + data.frequency + '/' + data.total + ', Score: ' + data.score + ')';
      Relief.emit('notify', {
        type: 'negative',
        message: message,
      });
    });


  },

]);
