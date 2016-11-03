(function() {

  const app = angular.module(
    'Wallet', []
  );

  app.controller('MainCtrl', function($scope, $timeout) {

    let appData;
    $scope.strings = {};
    $scope.addresses = [];
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
      Relief.persistence.db.user.getDoc(function(err, doc) {
        if (err) {
          return Relief.log.error(err);
        }
        $scope.addresses = doc.addresses;
        $scope.$apply();
      });
    });

    $scope.setPage = function(page) {
      $scope.page = page;
    }

    $scope.getIconClass = function(category) {
      for (let i in $scope.addressCategories) {
        const cat = $scope.addressCategories[i];
        if (cat.name === category) {
          return cat.icon;
        }
      }
    };

    $scope.generatePassphrase = function() {
      Relief.passphrase.generate(12, function(phrase) {
        $scope.forms.createAddress.passphrase = phrase;
        $scope.$apply();
      });
    };

    $scope.createAddress = function() {
      const form = $scope.forms.createAddress;
      if (form.type === 'nxt') {
        const addr = Relief.nxt.generateAddress(form.passphrase);
        form.address = addr.address;
        form.publicKey = addr.publicKey;
      }
      $scope.forms.createAddress.step++;
    };

    $scope.saveAddress = function() {
      const form = $scope.forms.createAddress;
      const onGetDoc = function(err, doc) {
        if (err) {
          return Relief.log.error(err);
        }

        let addresses = doc.addresses
          ? doc.addresses
          : [];

        addresses.push({
          type: form.type,
          label: form.label,
          category: form.category.name,
          address: form.address,
          publicKey: form.publicKey,
          privateKey: form.passphrase,
        });
        Relief.persistence.db.user.update({ addresses: addresses }, onUpdate);
      };

      const onUpdate = function(err) {
        if (err) {
          return Relief.log.error(err);
        }
        // TODO
      };

      Relief.persistence.db.user.getDoc(onGetDoc);
    };

  });

})();
