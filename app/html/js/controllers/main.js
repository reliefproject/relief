(function() {

  app.controller(
    'MainCtrl',
    ['$scope', '$sce',
    function($scope, $sce) {


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
        }
      });


      Relief.on('nxt.BlockHeight', function(height) {
        $scope.nxtBlockHeight = height;
        $scope.$apply();
      });


    },
  ]);

})();
