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


  const getPath = filename => {
    return path.join(dbDir, filename + env.dbSuffix);
  };


  const init = () => {
    const appDbPath = getPath(env.appDbName);
    db.app = new Storage({
      id: 'app',
      filename: appDbPath,
      createIfNotExists: true,
    });
    return new Promise((resolve, reject) => {
      if (db.app instanceof Error) {
        return reject(db.app);
      }
      resolve();
    });
  };


  const initUserDb = (username, key) => {
    const dbPath = getPath(env.userDbPrefix + username);
    db.user = new Storage({
      id: 'user',
      filename: dbPath,
      encryptionKey: key,
    });
    return new Promise((resolve, reject) => {
      if (db.user instanceof Error) {
        return reject(db.user);
      }
      resolve();
    });
  };


  const createUserDb = (username, key) => {
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
    return new Promise((resolve, reject) => {
      if (db.user instanceof Error) {
        return reject(db.user);
      }
      for (let i in env.defaultPlugins) {
        const plugin = env.defaultPlugins[i];
        if (plugin === 'start') {
          continue;
        }
        schema.plugins[plugin] = {
          enabled: true,
          showInMenu: true,
          isBuiltIn: true,
        };
      }
      db.user.insertDoc(schema)
      .then(resolve, reject);
    });
  };


  const unsetUserDb = function() {
    db.user = {};
  };


  module.exports = {
    init,
    initUserDb,
    createUserDb,
    unsetUserDb,
    db,
  };


})();
