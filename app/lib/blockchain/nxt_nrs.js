(function() {

  module.exports = function(servers) {


    const nxtjs = require('nxtjs');
    const DoubleChecker = require('doublechecker');
    const log = require('../log');
    const env = require('../env');


    const client = new DoubleChecker({
      numUseSources: env.nxtNumSources,
      dataType: 'json',
      ignoreJSONKeys: env.nxtIgnoreJSONKeys,
      sources: servers,
    });


    this.generateAddress = function(passphrase) {
      const address = nxtjs.secretPhraseToAccountId(passphrase);
      const numeric = nxtjs.convertRS(address).account;
      const publicKey = nxtjs.secretPhraseToPublicKey(passphrase);
      return {
        address: address,
        numeric: numeric,
        publicKey: publicKey,
      };
    };


    this.getTransactionsByAddress = function(address, callback) {
      const req = {
        requestType: 'getBlockchainTransactions',
        executedOnly: true,
        account: address,
      };
      this.client.request(req, function(err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, result);
      });
    };


    // Passthrough function
    this.client = client;


    return this;

  };

})();
