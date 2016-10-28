const assert = require('assert');
const user = require('../app/lib/user');

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
