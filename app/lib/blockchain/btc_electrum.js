(function() {

  module.exports = function(servers) {

    const DoubleChecker = require('doublechecker');
    const bitcoin = require('bitcoinjs-lib');
    const bigi = require('bigi');
    const log = require('../log');
    const env = require('../env');

    const client = new DoubleChecker({
      numUseSources: env.electrumNumSources,
      dataType: 'json',
      ignoreJSONKeys: env.electrumIgnoreJSONKeys,
      sources: servers,
    });

    this.generateAddress = function(passphrase) {
      const hash = bitcoin.crypto.sha256(passphrase);
      const d = bigi.fromBuffer(hash);
      const keyPair = new bitcoin.ECPair(d);

      return {
        address: keyPair.getAddress(),
        privateKey: keyPair.toWIF(),
      };
    };

    this.getTransactionsByAddress = function(address, callback) {
      const req = {
        id: 1,
        method: 'blockchain.address.get_history',
        params: [address],
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
