(function() {

  const app = angular.module(
    'Wallet', []
  );

  app.filter('formatCurrency', function() {
    return function(amount, decimals) {
      if (isNaN(amount)) {
        return '';
      }
      if (decimals === 0 || !decimals) {
        return amount;
      }
      return amount / Math.pow(10, decimals);
    };
  });

  app.controller('MainCtrl', function($scope, $timeout) {

    let appData;
    $scope.strings = {};
    $scope.addresses = [];
    $scope.balances = {};
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
      editAddress: {},
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

      updateBalances();
      updateAddresses();

    });

    const updateAddresses = function() {
      Relief.persistence.db.user.getDoc(function(err, doc) {
        if (err) {
          return Relief.log.error(err);
        }
        $scope.addresses = doc.addresses;
        $scope.$apply();
      });
    };

    const updateBalances = function() {
      Relief.user.getBalances(function(err, data) {
        if (err) {
          return Relief.log.info(err);
        }
        $scope.balances = data;
        $scope.$apply();
      });
    };

    const getCategoryByName = function(cat) {
      for (var i in $scope.addressCategories) {
        if ($scope.addressCategories[i].name === cat) {
          return $scope.addressCategories[i];
        }
      }
      return {};
    };

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

    $scope.copyToClipboard = function(string) {
      Clipboard.writeText(string);
    };

    $scope.createAddress = function() {
      const form = $scope.forms.createAddress;
      if (form.type === 'nxt') {

        const addr = Relief.nxt.generateAddress(form.passphrase);
        form.address = addr.address;
        form.publicKey = addr.publicKey;

      } else if (form.type === 'btc') {

        const addr = Relief.btc.generateAddress(form.passphrase);
        form.address = addr.address;
        form.privateKey = addr.privateKey;

      }
      $scope.forms.createAddress.step++;
    };

    // TODO make this shorter
    $scope.saveAddress = function() {
      const form = $scope.forms.createAddress;
      const onGetDoc = function(err, doc) {
        if (err) {
          return Relief.log.error(err);
        }

        let addresses = doc.addresses
          ? doc.addresses
          : [];

        const privKey = form.type === 'nxt'
          ? form.passphrase
          : form.privateKey;

        addresses.push({
          type: form.type,
          label: form.label,
          category: form.category.name,
          address: form.address,
          publicKey: form.publicKey,
          privateKey: privKey,
        });
        Relief.persistence.db.user.update({ addresses: addresses }, onUpdate);
      };

      const onUpdate = function(err) {
        if (err) {
          return Relief.log.error(err);
        }
        angular.element('#modalCreateAccount').modal('hide');
        $scope.forms.createAddress = {
          step: 1,
          type: 'btc',
          category: $scope.addressCategories[0],
          label: '',
          passphrase: '',
        };
        updateAddresses();
        updateBalances();
      };

      Relief.persistence.db.user.getDoc(onGetDoc);
    };

    $scope.setAddressToEdit = function(address) {
      $scope.forms.editAddress = angular.copy(address);
      $scope.forms.editAddress.category = getCategoryByName(address.category);
    };

    // TODO saner update func
    $scope.saveEditedAddress = function() {
      let addr = $scope.forms.editAddress;
      addr.category = addr.category.name;
      const onGetDoc = function(err, doc) {
        if (err) {
          // TODO error
          return;
        }
        let addresses = doc.addresses;
        for (var i in addresses) {
          if (addresses[i].address === addr.address) {
            addresses[i] = addr;
          }
        }
        Relief.persistence.db.user.update({ addresses: addresses }, onUpdate);
      };
      const onUpdate = function(err) {
        if (err) {
          // TODO
          return;
        }
        angular.element('#modalEditAccount').modal('hide');
        $scope.forms.editAddress = {};
        updateAddresses();
      };
      Relief.persistence.db.user.getDoc(onGetDoc);
    };

  });

})();
