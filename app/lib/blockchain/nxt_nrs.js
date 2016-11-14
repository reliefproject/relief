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
      const numeric = nxtjs.rsConvert(address).account;
      const publicKey = nxtjs.secretPhraseToPublicKey(passphrase);
      return {
        address: address,
        numeric: numeric,
        publicKey: publicKey,
      };
    };


    // Passthrough function
    this.request = function(options) {
      log.debug('Nxt request:', options);
      return new Promise(function(resolve, reject) {
        client.request(options, function(err, data) {
          if (err) {
            return reject(err);
          }
          log.debug('Nxt response:', data);
          resolve(data);
        });
      });
    };


    return this;

  };

})();
