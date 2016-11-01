module.exports = function(servers) {

  const DoubleChecker = require('doublechecker');
  const log = require('../log');
  const env = require('../env');

  const client = new DoubleChecker({
    numUseSources: env.nxtNumSources,
    dataType: 'json',
    ignoreJSONKeys: ['requestProcessingTime'],
    sources: servers,
  });

  // Passthrough function
  this.request = client.request;

  return this;
};
