const crypto = require('crypto');
const assert = require('assert');
const path = require('path');
const jetpack = require('fs-jetpack');
const { app } = require('electron');
const env = require('../app/lib/env');
const persistence = require('../app/lib/persistence/persistence');

describe('persistence init', function() {
  it('create application DB', function(done) {
    persistence.init(function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
  it('can write to app DB', function(done) {
    persistence.db.app.insertDoc({ language: 'en' }, function(err) {
      assert.equal(err, undefined);
      done();
    }) ;
  });
  it('can read from app DB', function(done) {
    persistence.db.app.getDoc(function(err, doc) {
      assert.equal(err, undefined);
      assert.equal(doc.language, 'en');
      done();
    });
  });
});

describe('user db', function() {
  it('create a new user db', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.createUserDb('newuser', key, function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
  it('can write into user db', function(done) {
    persistence.db.user.update({ food: 'sandwich' }, function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
  it('can read from user db', function(done) {
    persistence.db.user.getDoc(function(err,doc) {
      assert.equal(err, undefined);
      assert.equal(doc.food, 'sandwich');
      done();
    });
  });
  it('can unset the user db', function(done) {
    persistence.unsetUserDb(function(err) {
      assert.equal(err, undefined);
      assert.deepEqual(persistence.db.user, {});
      done();
    });
  });
  it('can init the user db', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.initUserDb('newuser', key, function(err) {
      assert.equal(err, undefined);
      done();
    });
  });
  it('should not load user db', function(done) {
    const key = crypto.pbkdf2Sync('wrongpass', 'salt', 100000, 32, 'sha512');
    persistence.initUserDb('newuser', key, function(err) {
      assert.equal((err instanceof Error), true);
      done();
    });
  });
});
