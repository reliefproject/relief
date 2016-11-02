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
    return nxtjs.secretPhraseToAccountId(passphrase);
  };

  // Passthrough function
  this.client = client;

  return this;
};
