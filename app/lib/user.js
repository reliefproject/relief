(function() {


  const { app } = require('electron');
  const crypto = require('crypto');
  const path = require('path');
  const uuid = require('node-uuid');
  const jetpack = require('fs-jetpack');
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


  const login = function(username, password) {
    return persistence.db.app.getDoc()
    .then(function(doc) {
      if (!doc.users[username]) {
        throw new Error('Unknown user');
      }
      const salt = doc.users[username].salt;
      const key = getHash(password, salt);
      return persistence.initUserDb(username, key);
    });
  };


  const logout = function() {
    persistence.unsetUserDb();
  };


  const isLoggedIn = function() {
    return Object.keys(persistence.db.user).length > 0;
  };


  const createAccount = function(userData) {
    let appData = {};
    const salt = uuid.v4();

    return persistence.db.app.getDoc()
    .then(function(doc) {
      appData = doc;
      if (!appData.users) {
        appData.users = {};
      }
      if (appData.users[userData.username] !== undefined) {
        throw new Error('User already exists');
      }
      const key = getHash(userData.password, salt);
      return persistence.createUserDb(userData.username, key);
    })

    .then(function() {
      const user = {
        username: userData.username,
        salt: salt,
      };
      appData.users[userData.username] = user;
      return persistence.db.app.updateDoc(appData);
    })

    .then(function() {
      return persistence.db.user.update({
        username: userData.username,
      });
    });
  };


  const exportKeys = function(format, targetFile) {
    return persistence.db.user.getDoc()
    .then(function(userData) {
      if (jetpack.exists(targetFile)) {
        throw new Error('File already exists');
      }
      let fileContents;
      if (format === 'json') {
        fileContents = userData.addresses;
      } else {
        throw new Error('Unknown format');
      }
      jetpack.write(targetFile, fileContents);
    });
  };


  const importKeys = function(data) {
    let keys = JSON.parse(data);
    return persistence.db.user.getDoc().then(function(userData) {
      for (let i in env.addressTypes) {
        const type = env.addressTypes[i];
        if (!keys[type]) {
          continue;
        }
        for (addressId in keys[type]) {
          const address = keys[type][addressId];
          for (let k in env.importRequiredKeys) {
            const key = env.importRequiredKeys[k];
            if (!(key in address)) {
              throw new Error('Missing key ' + key);
            }
          }
          if (!keys[type][addressId].label) {
            keys[type][addressId].label = '';
          }
          if (!keys[type][addressId].category) {
            keys[type][addressId].category = 'default';
          }
        }
        Object.assign(userData.addresses[type], keys[type]);
      }
      return persistence.db.user.update({
        addresses: userData.addresses,
      });
    });
  };


  module.exports = {
    login: login,
    logout: logout,
    isLoggedIn, isLoggedIn,
    createAccount: createAccount,
    exportKeys: exportKeys,
    importKeys: importKeys,
  };


})();
