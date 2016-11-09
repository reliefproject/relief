(function() {


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
  };
  const dbDir = path.join(
    electronApp.getPath('userData'),
    env.dbDir
  );
  jetpack.dir(dbDir);


  const getPath = function(filename) {
    return path.join(dbDir, filename + env.dbSuffix);
  };


  const init = function() {
    const appDbPath = getPath(env.appDbName);
    db.app = new Storage({
      id: 'app',
      filename: appDbPath,
      createIfNotExists: true,
    });
    return new Promise(function(resolve, reject) {
      if (db.app instanceof Error) {
        return reject(db.app);
      }
      resolve();
    });
  };


  const initUserDb = function(username, key) {
    const dbPath = getPath(env.userDbPrefix + username);
    db.user = new Storage({
      id: 'user',
      filename: dbPath,
      encryptionKey: key,
    });
    return new Promise(function(resolve, reject) {
      if (db.user instanceof Error) {
        return reject(db.user);
      }
      resolve();
    });
  };


  const createUserDb = function(username, key) {
    const dbPath = getPath(env.userDbPrefix + username);
    const schemaFile = path.join(
      __dirname, '..', '..', 'data', 'schema_user.json'
    );
    const schema = JSON.parse(
      jetpack.read(schemaFile)
    );
    db.user = new Storage({
      id: 'user',
      filename: dbPath,
      encryptionKey: key,
      createIfNotExists: true,
    });
    return new Promise(function(resolve, reject) {
      if (db.user instanceof Error) {
        return reject(db.user);
      }
      db.user.insertDoc(schema)
      .then(resolve, reject);
    });
  };


  const unsetUserDb = function() {
    db.user = {};
  };


  module.exports = {
    init: init,
    initUserDb: initUserDb,
    createUserDb: createUserDb,
    unsetUserDb: unsetUserDb,
    db: db,
  };


})();
