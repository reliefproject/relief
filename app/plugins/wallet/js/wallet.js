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

    $scope.addressCategories = Relief.env.addressCategories;

    $scope.forms = {
      createAddress: {
        step: 1,
        type: 'btc',
        category: $scope.addressCategories[0],
        label: '',
        passphrase: '',
      },
    };


    Relief.persistence.db.app.getDoc(function(err, data) {
      if (err) {
        return Relief.log.error(err);
      }
      if (data) {
        appData = data;
      }
      Relief.i18n.loadStrings(appData.language, function(err, strings) {
        if (err) {
          return Relief.log.error(err);
        }
        $scope.strings = strings.wallet;

        for (let i in $scope.addressCategories) {
          const category = $scope.addressCategories[i];
          const key = 'CATEGORY_' + category.name.toUpperCase();
          const title = strings.wallet[key];
          $scope.addressCategories[i].title = title;
        }

        $scope.$apply();
      });
    });
  });

})();
