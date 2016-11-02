(function() {

  const app = angular.module(
    'Wallet', []
  );

  app.controller('MainCtrl', function($scope, $timeout) {

    let appData;
    $scope.strings = {};
    $scope.page = 'balances';

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



    $scope.setPage = function(page) {
      $scope.page = page;
    }

    $scope.generatePassphrase = function() {
      Relief.passphrase.generate(12, function(phrase) {
        $scope.forms.createAddress.passphrase = phrase;
        $scope.$apply();
      });
    };

    $scope.createAddress = function() {
      const form = $scope.forms.createAddress;
      //Relief.log.info(Relief.blockchain)
      if (form.type === 'nxt') {
        form.address = Relief.blockchain.nxt.generateAddress(form.passphrase);
        Relief.log.info(form.address)
      }
      $scope.forms.createAddress.step++;
    };

  });

})();
