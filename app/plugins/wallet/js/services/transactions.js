(function() {

  app.service('Transactions', function() {
    var service = {
      transactions: {},
      loadTransactions: function(address, callback) {
        if (address.type === 'btc') {
          Relief.btc.getTransactionsByAddress(
            address.address,
            function(err, data) {
              if (err) {
                return callback(err);
              }
              service.transactions = data;
              callback();
            }
          );
        }
        if (address.type === 'nxt') {
          Relief.nxt.getTransactionsByAddress(
            address.address,
            function(err, data) {
              if (err) {
                return callback(err);
              }
              service.transactions = data;
              callback();
            }
          );
        }
      },
    };
    return service;
  });

})();
