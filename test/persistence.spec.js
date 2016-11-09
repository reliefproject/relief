const crypto = require('crypto');
const assert = require('assert');
const path = require('path');
const jetpack = require('fs-jetpack');
const { app } = require('electron');
const env = require('../app/lib/env');
const persistence = require('../app/lib/persistence/persistence');

describe('persistence init', function() {
  it('create application DB', function(done) {
    persistence.init().then(function() {
      assert(true);
      done();
    });
  });
  it('can write to app DB', function(done) {
    persistence.db.app.insertDoc({ language: 'en' })
    .then(function() {
      assert(true);
      done();
    });
  });
  it('can read from app DB', function(done) {
    persistence.db.app.getDoc()
    .then(function(doc) {
      assert.equal(doc.language, 'en');
      done();
    });
  });
});

describe('user db', function() {
  it('create a new user db', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.createUserDb('newuser', key)
    .then(function() {
      assert(true);
      done();
    });
  });
  it('can write into user db', function(done) {
    persistence.db.user.update({ food: 'sandwich' })
    .then(function() {
      assert(true);
      done();
    });
  });
  it('can read from user db', function(done) {
    persistence.db.user.getDoc()
    .then(function(doc) {
      assert.equal(doc.food, 'sandwich');
      done();
    });
  });
  it('can unset the user db', function(done) {
    persistence.unsetUserDb();
    assert.deepStrictEqual(persistence.db.user, {});
    done();
  });
  it('can init the user db', function(done) {
    const key = crypto.pbkdf2Sync('pass', 'salt', 100000, 32, 'sha512');
    persistence.initUserDb('newuser', key)
    .then(function() {
      assert(true);
      done();
    });
  });
  it('should not load user db', function(done) {
    const key = crypto.pbkdf2Sync('wrongpass', 'salt', 100000, 32, 'sha512');
    persistence.initUserDb('newuser', key)
    .then(undefined, function(err) {
      assert.equal((err instanceof Error), true);
      done();
    });
  });
});
