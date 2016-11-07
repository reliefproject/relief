(function() {


  const crypto = require('crypto');
  const uuid = require('node-uuid');
  const async = require('async');
  const env = require('./env');
  const log = require('./log');
  const blockchain = require('./blockchain/blockchain');
  const persistence = require('./persistence/persistence');


  const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      env.pbkdf2Iterations,
      env.pbkdf2Keylen,
      env.pbkdf2Digest
    );
  };


  const login = function(username, password, callback) {
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      if (!doc.users[username]) {
        return callback(new Error('Unknown user'));
      }
      const salt = doc.users[username].salt;
      const key = getHash(password, salt);
      persistence.initUserDb(username, key, onInitUserDb);
    };
    const onInitUserDb = function(err) {
      if (err) {
        return callback(err);
      }
      callback();
    };
    persistence.db.app.getDoc(onGetDoc);
  };


  const logout = function(callback) {
    persistence.unsetUserDb(callback);
  };


  const isLoggedIn = function() {
    return Object.keys(persistence.db.user).length > 0;
  };


  const createAccount = function(userData, callback) {
    let appData = {};
    const salt = uuid.v4();
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      appData = doc;
      if (!appData.users) {
        appData.users = {};
      }
      if (appData.users[userData.username] !== undefined) {
        return callback(new Error('User already exists'));
      }
      const key = getHash(userData.password, salt);
      persistence.createUserDb(
        userData.username,
        key,
        onCreateUserDb
      );
    };
    const onCreateUserDb = function(err) {
      if (err) {
        return callback(err);
      }
      const user = {
        username: userData.username,
        salt: salt,
      };
      appData.users[userData.username] = user;
      persistence.db.app.updateDoc(appData, onUpdateDoc);
    };
    const onUpdateDoc = function(err) {
      if (err) {
        return callback(err);
      }
      persistence.db.user.update(
        { username: userData.username },
        callback
      );
    };
    persistence.db.app.getDoc(onGetDoc);
  };


  module.exports = {
    login: login,
    logout: logout,
    isLoggedIn, isLoggedIn,
    createAccount: createAccount,
  };


})();
