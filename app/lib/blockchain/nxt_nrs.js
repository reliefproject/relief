module.exports = function(servers) {

  const DoubleChecker = require('doublechecker');
  const log = require('../log');
  const env = require('../env');

  const client = new DoubleChecker({
    numUseSources: env.nxtNumSources,
    dataType: 'json',
    ignoreJSONKeys: env.nxtIgnoreJSONKeys,
    sources: servers,
  });

  // Passthrough function
  this.client = client;

  return this;
};
