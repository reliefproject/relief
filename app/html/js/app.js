const app = angular.module('MainApp', []);

app.controller(
  'TabsCtrl',
  ['$scope', '$sce', '$timeout',
  function($scope, $sce, $timeout) {

    let appData = {};
    $scope.tabs = {};
    $scope.nxtBlockHeight = '';

    $scope.selectTab = function(tabId) {
      $scope.selectedTab = tabId;
    };

    $scope.openTab = function(tabId, tab, select) {
      select = select === undefined
        ? true
        : select;
      $scope.tabs[tabId] = tab;
      if (select) {
        $scope.selectTab(tabId)
      }
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
      Relief.plugin.loadPlugin('start', function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        $scope.tabs = {};
        $scope.tabs['start'] = data;
        updateTabData();
        $scope.selectedTab = 'start';
        $scope.$apply();

        setTimeout(function() {
              const webview = document.getElementById('start');
              //              Webview.openDevTools();
            }, 1000);
      });
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
      return '../plugins/' + plugin.name + '/' + plugin.main;
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
      $scope.$apply();
    };

    Relief.db.app.getDoc(function(err, doc) {
      if (err) {
        return Relief.log.error(err);
      }
      if (!doc) {
        appData = {
          language: Relief.env.defaultLanguage,
        };
      } else {
        appData = doc;
      }
      // First start, we're not logged in
      $scope.loggedOut();
    });

    Relief.on('loggedIn', function() {
      $scope.isLoggedIn = true;
      let newTabs = {};
      const onWalletLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        newTabs['wallet'] = data;
        Relief.plugin.loadPlugin('apps', onAppsLoad);
      };
      const onAppsLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        newTabs['apps'] = data;
        Relief.plugin.loadPlugin('transact', onTransactLoad);
      };
      const onTransactLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        newTabs['transact'] = data;
        delete $scope.tabs['start'];
        // Put the new tabs first, in case another tab
        // e.g. "help" is already open
        const oldTabs = $scope.tabs;
        $scope.tabs = newTabs;
        for (var k in oldTabs) {
          $scope.tabs[k] = oldTabs[k];
        }
        updateTabData();
        $scope.selectTab('wallet');
        $scope.$apply();
      };
      Relief.plugin.loadPlugin('wallet', onWalletLoad);
    });

    Relief.on('languageChanged', function(lang) {
      if (lang !== appData.language) {
        appData.language = lang;
        updateTabData();
      }
    });

    Relief.on('nxt.BlockHeight', function(height) {
      $scope.nxtBlockHeight = height;
      $scope.$apply();
    });
  },
]);
