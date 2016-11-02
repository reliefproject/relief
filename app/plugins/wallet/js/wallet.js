(function() {

  const app = angular.module(
    'Wallet', []
  );

  app.controller('MainCtrl', function($scope, $timeout) {

    let appData;
    $scope.strings = {};
    $scope.page = 'balances';

    $scope.setPage = function(page) {
      $scope.page = page;
    }

    $scope.forms = {
      createAddress: {
        step: 1,
        type: 'btc',
        category: { icon: 'icon-record' },
        label: '',
        passphrase: '',
      },
    };


    $scope.addressCategories = [
      { name: 'default', icon: 'icon-record' },
      { name: 'red', icon: 'icon-red' },
      { name: 'blue', icon: 'icon-blue' },
      { name: 'orange', icon: 'icon-orange' },
      { name: 'green', icon: 'icon-green' },
      { name: 'personal', icon: 'icon-user' },
      { name: 'public', icon: 'icon-megaphone' },
      { name: 'work', icon: 'icon-briefcase' },
      { name: 'trading', icon: 'icon-chart-area' },
      { name: 'favourite', icon: 'icon-heart' },
      { name: 'shopping', icon: 'icon-basket' },
      { name: 'rewards', icon: 'icon-trophy' },
    ];

    //$timeout(function() { $scope.page = 'keys'; }, 5000)
    /*
        Relief.persistence.db.app.getDoc(function(err, data) {
          if (err) {
            return Relief.log.error(err);
          }
          if (data) {
            appData = data;
          }

          // Get data
        });

        Relief.i18n.loadStrings(language, function(err, strings) {
          if (err) {
            return Relief.log.error(err);
          }
        });
    */
  });

})();
