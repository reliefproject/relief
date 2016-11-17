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


    this.generateAddress = passphrase => {
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
    this.request = options => {
      log.debug('Nxt request:', options);
      return new Promise(function(resolve, reject) {
        client.request(options, (err, data) => {
          if (err) {
            return reject(err);
          }
          log.debug('Nxt response:', data);
          if (data.score < 1) {
            Relief.emit('notify.dataInconsistency', {
              frequency: data.frequency,
              total: Math.round(data.frequency / data.score),
              score: data.score,
            });
          }
          resolve(data);
        });
      });
    };


    return this;

  };

})();
