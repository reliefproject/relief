const assert = require('assert');
const Blockchain = require('../app/lib/blockchain/blockchain');

const App = {
  env: require('../app/lib/env'),
  log: require('../app/lib/log'),
  window: require('../app/lib/window'),
  persistence: require('../app/lib/persistence/persistence'),
};

describe('blockchain', function() {
  it('inits without error', function(done) {
    App.persistence.init(function(err) {
      Blockchain(App).init(function(err) {
        assert.equal(err, undefined);
        done();
      });
    });
  });
});
