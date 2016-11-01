const assert = require('assert');
const events = require('events');
const Blockchain = require('../app/lib/blockchain/blockchain');

describe('blockchain', function() {
  it('inits without error', function(done) {
    const blockchain = Blockchain({
      events: new events.EventEmitter(),
    });
    blockchain.init();
    assert.equal(typeof blockchain.btc.client, 'object');
    assert.equal(typeof blockchain.nxt.client, 'object');
    done();
  });
});
