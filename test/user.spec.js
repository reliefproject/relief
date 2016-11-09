const assert = require('assert');
const path = require('path');
const jetpack = require('fs-jetpack');
const user = require('../app/lib/user');
const persistence = require('../app/lib/persistence/persistence');

describe('user', function() {
  it('creates a user', function(done) {
    user.createAccount({
      username: 'dummy',
      password: 'pass',
    }).then(function() {
      console.log('test')
      assert(true);
      done();
    });
  });
  it('fails because username is taken', function(done) {
    user.createAccount({
      username: 'dummy',
      password: 'pass',
    }).then(undefined, function(err) {
      assert.equal((err instanceof Error), true);
      done();
    });
  });
  it('logs in', function(done) {
    user.login('dummy', 'pass')
    .then(function() {
      const isLoggedIn = user.isLoggedIn();
      assert.equal(isLoggedIn, true);
      done();
    });
  });
  it('exports keys json', function(done) {
    jetpack.remove('/tmp/relief_keys.json');
    user.exportKeys('json', '/tmp/relief_keys.json')
    .then(function() {
      assert(true);
      done();
    });
  });
  it('imports keys from file', function(done) {
    const file = path.join(__dirname, 'data', 'relief_keys.json');
    const data = jetpack.read(file);
    user.importKeys(data)
    .then(function() {
      assert(true);
      persistence.db.user.getDoc().then(function(doc) {
        assert.equal(
          doc.addresses.nxt['4273301882745002507'].privateKey,
          'test'
        );
        done();
      });
    });
  });
  it('logs out', function(done) {
    user.logout();
    const isLoggedIn = user.isLoggedIn();
    assert.equal(isLoggedIn, false);
    done();
  });
  it('fails to login', function(done) {
    user.login('dummy', 'wrongpass')
    .then(undefined, function(err) {
      const isLoggedIn = user.isLoggedIn();
      assert.equal((err instanceof Error), true);
      assert.equal(isLoggedIn, false);
      done();
    });
  });
});
