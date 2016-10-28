const crypto = require('crypto');
const uuid = require('node-uuid');
const persistence = require('./persistence/persistence');

const getHash = function(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
};

const login = function(username, password) {

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

  const onGetDoc = function(err, doc) {
    if (err) {
      return callback(err);
    }
    appData = doc;
    if (appData.users[userData.username] !== undefined) {
      return callback(new Error('User already exists'));
    }
    const salt = uuid.v4();
    const key = getHash(password, salt);
    persistence.createUserDb(userData.username, key, onCreateUserDb);
  };

  const onCreateUserDb = function(err) {
    if (err) {
      return callback(err);
    }
    const user = {
      username: data.username,
      salt: salt,
    };
    appData.users[data.username] = user;
    persistence.db.app.updateDoc(appData, onUpdateDoc);
  };

  const onUpdateDoc = function(err) {
    if (err) {
      return callback(err);
    }
    delete data.password;
    persistence.db.user.insertDoc(userData, callback);
  };

  persistence.db.app.getDoc(onGetDoc);
};

module.exports = {
  login: login,
  logout: logout,
  isLoggedIn: isLoggedIn,
  createAccount, createAccount,
};
