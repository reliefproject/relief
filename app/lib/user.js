module.exports = function(Relief) {

  const crypto = require('crypto');
  const uuid = require('node-uuid');
  const env = require('./env')
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

  this.login = function(username, password, callback) {

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

  this.logout = function(callback) {
    persistence.unsetUserDb(callback);
  };

  this.isLoggedIn = function() {
    return Object.keys(persistence.db.user).length > 0;
  };

  this.createAccount = function(userData, callback) {
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
      persistence.createUserDb(userData.username, key, onCreateUserDb);
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
      delete userData.password;
      persistence.db.user.insertDoc(userData, callback);
    };

    persistence.db.app.getDoc(onGetDoc);
  };

  return this;
};
