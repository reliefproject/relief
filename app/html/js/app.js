const app = angular.module('MainApp', []);

app.controller(
  'TabsCtrl',
  ['$scope', '$sce', '$timeout',
  function($scope, $sce, $timeout) {

    $scope.tabs = {};

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

    const getPluginSrc = function(plugin) {
      return '../plugins/' + plugin.name + '/' + plugin.main;
    }

    Relief.plugin.loadPlugin('start', function(err, data) {
      if (err) {
        return Relief.log.error(err);
      }
      data.fixed = true;
      data.url = getPluginSrc(data);
      $scope.tabs['start'] = data;
      $scope.selectedTab = 'start';
      $scope.$apply();

      setTimeout(function() {
            const webview = document.getElementById('start');
            webview.openDevTools();
          }, 1000);
    });

    Relief.events.on('loggedIn', function() {
      let wallet = {};
      let apps = {};
      const onWalletLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        wallet = data;
        Relief.plugin.loadPlugin('apps', onAppsLoad);
      };
      const onAppsLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        apps = data;
        Relief.plugin.loadPlugin('transact', onTransactLoad);
      };
      const onTransactLoad = function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        wallet.fixed = true;
        apps.fixed = true;
        data.fixed = true;
        wallet.url = getPluginSrc(wallet);
        apps.url = getPluginSrc(apps);
        data.url = getPluginSrc(data);
        $scope.tabs['wallet'] = wallet;
        $scope.tabs['apps'] = apps;
        $scope.tabs['transact'] = data;
        delete $scope.tabs['start'];
        $scope.selectTab('wallet');
        $scope.$apply();
      };
      Relief.plugin.loadPlugin('wallet', onWalletLoad);
    });
  },
]);
