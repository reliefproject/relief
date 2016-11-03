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

    // Passthrough function
    this.client = client;

    return this;
  };

})();
