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




    Relief.persistence.db.user.getDoc(function(err, doc) {
      Relief.log.info(doc);
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
      if (form.type === 'nxt') {
        const addr = Relief.nxt.generateAddress(form.passphrase);
        form.address = addr.address;
        form.publicKey = addr.publicKey;
      }
      $scope.forms.createAddress.step++;
    };

    $scope.saveAddress = function() {
      Relief.log.info('save')
      const form = $scope.forms.createAddress;
      Relief.persistence.db.user.getDoc(function(err, doc) {
        Relief.log.info('got')
        if (err) {
          return Relief.log.error(err);
        }
        if (!doc.addresses) {
          doc.addresses = {};
        }
        if (doc.addresses[form.address]) {
          // Address already exists
          // TODO
          return;
        }
        doc.addresses[form.address] = {
          type: form.type,
          label: form.label,
          category: form.category.name,
          address: form.address,
          publicKey: form.publicKey,
          privateKey: form.passphrase,
        };
        Relief.log.info(doc.addresses)
        Relief.persistence.db.user.updateDoc(doc, function(err) {
          if (err) {
            return Relief.log.error(err);
          }
          Relief.log.info('done')
        });
      });
    };

  });

})();
