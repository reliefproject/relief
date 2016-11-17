const crypto = require('crypto');
const assert = require('assert');
const path = require('path');
const jetpack = require('fs-jetpack');
const { app } = require('electron');
const env = require('../app/lib/env');
const persistence = require('../app/lib/persistence/persistence');

describe('Application DB', function() {
  persistence.init();
  it('Can write to DB', function(done) {
    persistence.db.app.insertDoc({ language: 'en' })
    .then(function() {
      assert(true);
      done();
    });
  });
  it('Can read from DB', function(done) {
    persistence.db.app.getDoc()
    .then(function(doc) {
      assert.equal(doc.language, 'en');
      done();
    });
  });
});

describe('User DB', function() {
  it('Create a new user DB', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.createUserDb('newuser', key)
    .then(function() {
      assert(true);
      done();
    });
  });
  it('Can write into user DB', function(done) {
    persistence.db.user.update({ food: 'sandwich' })
    .then(function() {
      assert(true);
      done();
    });
  });
  it('Can read from user DB', function(done) {
    persistence.db.user.getDoc()
    .then(function(doc) {
      assert.equal(doc.food, 'sandwich');
      done();
    });
  });
  it('Can unset the user DB', function(done) {
    persistence.unsetUserDb();
    assert.deepStrictEqual(persistence.db.user, {});
    done();
  });
  it('Can init the user DB', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.initUserDb('newuser', key);
    const keys = Object.keys(persistence.db.user);
    assert(keys.length > 0);
    done();
  });
  it('should not load user db', function(done) {
    persistence.unsetUserDb();
    const key = crypto.pbkdf2Sync('wrongpass', 'salt', 100000, 32, 'sha512');
    try {
      persistence.initUserDb('newuser', key);
    } catch (e) {
      assert(e instanceof Error);
      done();
    }
  });
});
