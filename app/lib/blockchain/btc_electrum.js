module.exports = function(servers) {

  const DoubleChecker = require('doublechecker');
  const log = require('../log');
  const env = require('../env');

  const client = new DoubleChecker({
    numUseSources: env.electrumNumSources,
    dataType: 'json',
    ignoreJSONKeys: ['id'],
    sources: servers,
  });

  // Passthrough function
  this.request = client.request;

  return this;
};
