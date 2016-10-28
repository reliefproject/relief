const assert = require('assert');
const blockchain = require('../app/lib/blockchain/blockchain');

describe('blockchain', function() {
  it('inits without error', function(done) {
    this.timeout(5000);
    blockchain.init(function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
});
