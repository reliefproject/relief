(function() {

  app.service('Address', function() {
    var service = {
      transactions: [],
      balanceNxt: null,
      numAssets: null,
      numCurrencies: null,
      numAliases: null,

      getNxtBalance: function(address, callback) {
        const req = {
          requestType: 'getBalance',
          account: address,
        };
        Relief.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          service.balanceNxt = result.data.balanceNQT;
          callback();
        });
      },

      getNumAssets: function(address, callback) {
        const req = {
          requestType: 'getAccountAssetCount',
          account: address,
        };
        Relief.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          service.numAssets = result.data.numberOfAssets;
          callback();
        });
      },

      getNumCurrencies: function(address, callback) {
        const req = {
          requestType: 'getAccountCurrencyCount',
          account: address,
        };
        Relief.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          service.numCurrencies = result.data.numberOfCurrencies;
          callback();
        });
      },

      getNumAliases: function(address, callback) {
        const req = {
          requestType: 'getAliasCount',
          account: address,
        };
        Relief.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          service.numAliases = result.data.numberOfAliases;
          callback();
        });
      },

      loadTransactions: function(address, callback) {
        if (address.type === 'nxt') {
          Relief.nxt.getTransactionsByAddress(
            address.address,
            function(err, result) {
              if (err) {
                return callback(err);
              }
              service.transactions = result.data.transactions;
              callback();
            }
          );
        }
      },

      getSlice: function(page, itemsPerPage) {
        const start = ((page - 1) * itemsPerPage);
        const end = (start + itemsPerPage);
        return service.transactions.slice(start, end);
      },

    };

    return service;

  });

})();
