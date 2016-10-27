const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');
const uuid = require('uuid');
const env = require('../env');
const log = require('../log');
const Storage = require('./storage');

let db = {
  user: {},
  app: {},
  servers: {},
};
let user: {};
let app: {};
let servers: {};

const basePath = path.join(app.getPath('userData'), env.dbDir);

const init = function(callback) {

  const appDbPath = path.join(basePath, env.appDbName + env.dbSuffix);
  const serverDbPath = path.join(basePath, env.serverDbName + env.dbSuffix);

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
    app = doc;
    db.servers.getDoc(function(err, doc) {
      if (err) {
        return callback(err);
      }
      servers = doc;
      callback();
    });
  });
};

const initUserDb = function(username, password, callback) {
  const dbPath = path.join(basePath, env.userDbPrefix + username + env.dbSuffix);
  db.user = new Storage({
    id: 'user',
    filename: dbPath,
    encryptionKey: key,
  });
  if (db.user instanceof Error) {
    return callback(db.app);
  }
  db.user.getDoc(function(err, doc) {
    if (err) {
      return callback(err);
    }
    user = doc;
    callback();
  });
};


const createUserDb = function(username, key, callback) {
  const dbPath = path.join(basePath, env.userDbPrefix + username + env.dbSuffix);
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

module.exports = {
  init: init,
  initUserDb: initUserDb,
  createUserDb: createUserDb,
  db: db,
  app: app,
  user: user,
  servers: servers,
};
