(function() {

  app.service('User', function() {
    var service = {
      userData: {},
      balances: {},

      getBalances: function(callback) {
        Relief.user.getBalances(function(err, data) {
          if (err) {
            return callback(err);
          }
          service.balances = data;
          callback();
        });
      },

      getUserData: function(callback) {
        Relief.persistence.db.user.getDoc(function(err, doc) {
          if (err) {
            return callback(err);
          }
          service.userData = doc;
          callback();
        });
      },

      addAddress: function(address, callback) {
        let addresses = angular.copy(service.userData.addresses);
        addresses.push(address)
        Relief.persistence.db.user.update(
          { addresses: addresses },
          callback
        );
      },

      updateAddress: function(address, callback) {
        let addresses = angular.copy(service.userData.addresses);
        for (var i in addresses) {
          if (addresses[i].address === address.address) {
            addresses[i] = address;
          }
        }
        Relief.persistence.db.user.update(
          { addresses: addresses },
          callback
        );
      },

      deleteAddress: function(address, callback) {
        let addresses = angular.copy(service.userData.addresses);
        for (let i in addresses) {
          if (addresses[i].address === address) {
            delete addresses[i];
          }
        }
        Relief.persistence.db.user.update(
          { addresses: addresses },
          callback
        );
      },

    };
    return service;
  });

})();
