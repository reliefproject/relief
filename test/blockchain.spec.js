const assert = require('assert');
const events = require('events');
const blockchain = require('../app/lib/blockchain/blockchain');

global.Relief = new events.EventEmitter();

describe('blockchain', function() {
  it('inits without error', function(done) {
    blockchain.init();
    assert.equal(typeof blockchain.bc.nxt.client, 'object');
    done();
  });
});
