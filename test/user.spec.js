const assert = require('assert');
const user = require('../app/lib/user');
const persistence = require('../app/lib/persistence/persistence');

describe('user', function() {
  it('creates a user', function(done) {
    user.createAccount({
      username: 'dummy',
      password: 'pass',
    }, function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
  it('fails because username is taken', function(done) {
    user.createAccount({
      username: 'dummy',
      password: 'pass',
    }, function(err) {
      assert.equal((err instanceof Error), true);
      done();
    });
  });
  it('logs in', function(done) {
    user.login('dummy', 'pass', function(err) {
      const isLoggedIn = user.isLoggedIn();
      assert.equal(err, undefined);
      assert.equal(isLoggedIn, true);
      done();
    });

  });
  it('gets the users balances', function(done) {
    let addresses = [
      {
        type: 'btc',
        address: '1NS17iag9jJgTHD1VXjvLCEnZuQ3rJDE9L',
      },
      {
        type: 'btc',
        address: '1EZBqbJSHFKSkVPNKzc5v26HA6nAHiTXq6',
      },
      {
        type: 'btc',
        address: '1MDUVf2dRJ6wpam9vLyju3GWPAUPeGgQ6S',
      },
      {
        type: 'btc',
        address: '19N2f7xTHCVjXsdL3aGQPFFm8MZYmxchMX',
      },
      {
        type: 'nxt',
        address: 'NXT-DXWC-NADK-MCCZ-EZK8A',
      },
      {
        type: 'nxt',
        address: 'NXT-7LB8-8ZPX-3YR9-3L85B',
      },
      {
        type: 'nxt',
        address: 'NXT-MHJ2-E6M3-H5FY-2NCQ7',
      },
      {
        type: 'nxt',
        address: ' NXT-WSHC-U9Z4-BKN6-543CS',
      },
    ];
    persistence.db.user.update({ addresses: addresses }, function(err, data) {
      user.getBalances(function(err, data) {
        // TODO better
        assert.equal(err, undefined);
        done();
      });
    });
  });
  it('logs out', function(done) {
    user.logout(function(err) {
      const isLoggedIn = user.isLoggedIn();
      assert.equal(err, undefined);
      assert.equal(isLoggedIn, false);
      done();
    });
  });
  it('fails to login', function(done) {
    user.login('dummy', 'wrongpass', function(err) {
      const isLoggedIn = user.isLoggedIn();
      assert.equal((err instanceof Error), true);
      assert.equal(isLoggedIn, false);
      done();
    });
  });
});
