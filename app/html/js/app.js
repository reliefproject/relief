const app = angular.module('MainApp', []);

app.controller(
  'TabsCtrl',
  ['$scope', '$sce', '$timeout',
  function($scope, $sce, $timeout) {

    $scope.tabs = {
      wallet: {
        title: 'Wallet',
        icon: 'icon-home',
        fixed: true,
        url: '',
      },
      apps: {
        title: 'Apps',
        icon: 'icon-layout',
        fixed: true,
        url: '',
      },
      transact: {
        title: 'Transact',
        icon: 'icon-pencil',
        fixed: true,
        url: '',
      },
      eins: {
        title: 'Test 1',
        url: 'http://test.com',
      },
      zwei: {
        title: 'Test 2',
        url: 'http://getbootstrap.com',
      },
      drei: {
        title: 'Test 3',
        url: 'http://purecss.io/layouts/blog/',
      },
      vier: {
        title: 'Test 4',
        url: 'http://photonkit.com',
      },
    };

    $scope.selectedTab = 'zwei';

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

    /*$timeout(function() {
      $scope.openTab('fuenf', { title: 'Test Fünf', url: 'http://bitbucket.org' });
    }, 5000)*/
  },
]);
