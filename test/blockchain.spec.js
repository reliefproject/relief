const assert = require('assert');
const Blockchain = require('../app/lib/blockchain/blockchain');

describe('blockchain', function() {
  it('inits without error', function(done) {
    const blockchain = Blockchain();
    blockchain.init();
    assert.equal(typeof blockchain.btc.request, 'function');
    assert.equal(typeof blockchain.nxt.request, 'function');
    done();
  });
});
