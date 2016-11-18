const assert = require('assert');

describe('Crypto', () => {
  it('#generatePassphrase', done => {
    Relief.crypto.generatePassphrase(12).then(passphrase => {
      assert.equal(passphrase.split(' ').length, 12);
      done();
    }, err => {
      console.log(err.stack);
    });
  });
});
