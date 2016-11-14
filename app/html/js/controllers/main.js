(function() {


  const { shell } = require('electron');
  const contextMenu = require('electron-context-menu');


  app.controller(
    'MainCtrl',
    ['$scope', '$sce', 'i18n',
    function($scope, $sce, i18n) {


      let appData = {};
      $scope.strings = {};
      $scope.tabs = {};
      $scope.nxtBlockHeight = '';
      $scope.userAgent = Relief.env.appName + ' ' + Relief.env.version;
      $scope.referrer = Relief.env.referrer;

      $scope.selectTab = function(tabId) {
        $scope.selectedTab = tabId;
      };


      $scope.openTab = function(tabId, tab, select) {
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


      $scope.closeTab = function(tabId) {
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


      $scope.trustUrl = function(tab) {
        return $sce.trustAsResourceUrl(tab.url);
      };


      $scope.loggedOut = function() {
        $scope.isLoggedIn = false;
        const data = Relief.plugin.loadPlugin('start');
        $scope.tabs = {};
        $scope.tabs['start'] = data;
        $scope.selectedTab = 'start';
        updateTabData();
        $scope.$apply();
      };


      const getTabDisplayTitle = function(plugin) {
        if (plugin.title !== null && typeof plugin.title === 'object') {
          return plugin.title[appData.language]
            ? plugin.title[appData.language]
            : plugin.title[Relief.env.defaultLanguage];
        }
        return plugin.name;
      };


      const getPluginSrc = function(plugin) {
        const dir = Relief.env.getPath('plugin', Relief.env.standalone);
        return 'file://' + dir + '/' + plugin.name + '/' + plugin.main;
      }


      const updateTabData = function() {
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


      Relief.db.app.getDoc().then(function(doc) {
        appData = doc;
        if (!appData) {
          appData = {
            language: Relief.env.defaultLanguage,
          };
        }
        // First start, we're not logged in
        $scope.loggedOut();
        return i18n.loadStrings(appData.language)
        .then(function(strings) {
          $scope.strings = strings;
          $scope.$apply();
        });
      },
        // Error handler
        Relief.log.error
      );


      Relief.on('loggedIn', function() {
        $scope.isLoggedIn = true;
        let newTabs = {
          //keys: Relief.plugin.loadPlugin('keys'),
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
      });


      Relief.on('languageChanged', function(lang) {
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


      Relief.on('nxt.BlockHeight', function(height) {
        $scope.nxtBlockHeight = height;
        $scope.$apply();
      });


      Relief.on('webview.ready', function(id) {
        contextMenu({
          window: document.getElementById(id),
          showInspectElement: false,
          append: function(params) {
            return [{
              label: i18n.strings.COPY_IMAGE_URL,
              visible: params.mediaType === 'image',
              click: function() {
                Relief.clipboard.writeText(params.srcURL);
              },
            },
            {
              label: i18n.strings.OPEN_IMAGE,
              visible: params.mediaType === 'image',
              click: function() {
                shell.openExternal(params.srcURL);
              },
            },
            {
              label: i18n.strings.OPEN_LINK,
              visible: params.linkURL !== '',
              click: function() {
                shell.openExternal(params.linkURL);
              },
            }];
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


      Relief.on('webview.close', function() {
        const tabId = $scope.selectedTab;
        if(!$scope.tabs[tabId].fixed) {
          $scope.closeTab(tabId);
          $scope.$apply();
        }
      });


      Relief.on('webview.reload', function() {
        const webview = document.getElementById(
          $scope.selectedTab
        );
        webview.reload();
      });


      Relief.on('webview.devtools', function() {
        const webview = document.getElementById(
          $scope.selectedTab
        );
        webview.openDevTools();
      });


      Relief.on('webview.switchToNext', function() {
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


    },

  ]);

})();
