(function() {

  app.service('Transactions', function() {
    var service = {
      transactions: [],
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
