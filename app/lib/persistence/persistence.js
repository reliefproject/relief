const path = require('path');
const crypto = require('crypto');
const electronApp = require('electron').app;
const uuid = require('uuid');
const jetpack = require('fs-jetpack');
const env = require('../env');
const log = require('../log');
const Storage = require('./storage');

let db = {
  user: {},
  app: {},
  servers: {},
};
let stores = {
  user: {},
  app: {},
  servers: {},
};

const dbDir = path.join(
  electronApp.getPath('userData'),
  env.dbDir
);

jetpack.dir(dbDir);

const getPath = function(filename) {
  return path.join(dbDir, filename + env.dbSuffix);
};

const init = function(callback) {

  const appDbPath = getPath(env.appDbName);
  const serverDbPath = getPath(env.serverDbName);

  db.app = new Storage({
    id: 'app',
    filename: appDbPath,
    createIfNotExists: true,
  });
  db.servers = new Storage({
    id: 'servers',
    filename: serverDbPath,
    createIfNotExists: true,
  });

  if (db.app instanceof Error) {
    return callback(db.app);
  }
  if (db.servers instanceof Error) {
    return callback(db.servers);
  }

  db.app.getDoc(function(err, doc) {
      if (err) {
        return callback(err);
      }
      stores.app = doc === null
        ? {}
        : doc;
      db.servers.getDoc(function(err, doc) {
        if (err) {
          return callback(err);
        }
        stores.servers = doc === null
          ? {}
          : doc;
        callback();
      });
    });
};

const initUserDb = function(username, key, callback) {
  const dbPath = getPath(env.userDbPrefix + username);
  db.user = new Storage({
    id: 'user',
    filename: dbPath,
    encryptionKey: key,
  });
  if (db.user instanceof Error) {
    return callback(db.user);
  }
  db.user.getDoc(function(err, doc) {
    if (err) {
      return callback(err);
    }
    stores.user = doc === null
      ? {}
      : doc;
    callback();
  });
};


const createUserDb = function(username, key, callback) {
  const dbPath = getPath(env.userDbPrefix + username);
  db.user = new Storage({
    id: 'user',
    filename: dbPath,
    encryptionKey: key,
    createIfNotExists: true,
  });
  return db.user instanceof Error
    ? callback(db.user)
    : callback();
};

const unsetUserDb = function(callback) {
  db.user = {};
  stores.user = {};
  callback();
};

const getProperty = function(store, key) {
  return (stores[store] !== null && typeof stores[store] === 'object')
    ? stores[store][key]
    : undefined;
};

const setProperty = function(store, key, value, callback) {
  if (!stores[store] || typeof stores[store] !== 'object') {
    return callback(new Error('Unknown store'));
  }
  stores[store][key] = value;
  db[store].updateDoc(stores[store], callback);
};

module.exports = {
  init: init,
  initUserDb: initUserDb,
  createUserDb: createUserDb,
  unsetUserDb: unsetUserDb,
  db: db,
  getProperty: getProperty,
  setProperty: setProperty,
};
