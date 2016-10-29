module.exports = function(Relief) {

  const crypto = require('crypto');
  const uuid = require('node-uuid');

  const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      Relief.env.pbkdf2Iterations,
      Relief.env.pbkdf2Keylen,
      Relief.env.pbkdf2Digest
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
      Relief.persistence.initUserDb(username, key, onInitUserDb);
    };

    const onInitUserDb = function(err) {
      if (err) {
        return callback(err);
      }
      callback();
    };

    Relief.persistence.db.app.getDoc(onGetDoc);
  };

  this.logout = function(callback) {
    Relief.persistence.unsetUserDb(callback);
  };

  this.isLoggedIn = function() {
    return Object.keys(Relief.persistence.db.user).length > 0;
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
      Relief.persistence.createUserDb(userData.username, key, onCreateUserDb);
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
      Relief.persistence.db.app.updateDoc(appData, onUpdateDoc);
    };

    const onUpdateDoc = function(err) {
      if (err) {
        return callback(err);
      }
      delete userData.password;
      Relief.persistence.db.user.insertDoc(userData, callback);
    };

    Relief.persistence.db.app.getDoc(onGetDoc);
  };

  return this;
};
