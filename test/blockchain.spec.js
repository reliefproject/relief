const assert = require('assert');
const blockchain = require('../app/lib/blockchain/blockchain');

describe('blockchain', function() {
  it('inits without error', function(done) {
    blockchain.init(function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
});
