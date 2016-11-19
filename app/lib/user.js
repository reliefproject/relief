const { app } = require('electron');
const crypto = require('crypto');
const path = require('path');
const uuid = require('node-uuid');
const jetpack = require('fs-jetpack');

const env = require('./env');
const log = require('./log');
const blockchain = require('./blockchain/blockchain');
const DbManager = require('./db/db_manager');

const db = new DbManager();
const appDb = db.get('app');
let instance = null;


class User {


  constructor() {
    if (instance) {
      return instance;
    }
    instance = this;
  };


  create({ username, password }) {
    log.info('Creating new account');

    return appDb.getDoc().then(doc => {
      doc.users = doc.users || {};
      if (doc.users[username] !== undefined) {
        throw new Error('User already exists');
      }

      const salt = uuid.v4();
      const key = this.getHash(password, salt);
      db.init('user', { username, key }, true);
      doc.users[username] = { username, salt, };
      return appDb.updateDoc(doc);
    })

    .then(() => {
      const userDb = db.get('user');
      const schemaFile = path.join(
        __dirname, '..', 'data', 'schema_user.json'
      );
      let schema = jetpack.read(schemaFile, 'json');
      schema.username = username;
      for (let plugin of env.defaultPlugins) {
        if (plugin === 'start') {
          continue;
        }
        schema.plugins[plugin] = {
          enabled: true,
          showInMenu: true,
          isBuiltIn: true,
        };
      }
      return userDb.insertDoc(schema);
    });
  };


  getHash(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      env.pbkdf2Iterations,
      env.pbkdf2Keylen,
      env.pbkdf2Digest
    );
  };


  login(username, password) {
    log.info('User login');
    return appDb.getDoc().then(doc => {
      if (!doc.users[username]) {
        throw new Error('Unknown user');
      }
      const salt = doc.users[username].salt;
      const key = this.getHash(password, salt);
      db.init('user', { username, key });
    });
  };


  logout() {
    return db.unset('user');
  };


  isLoggedIn() {
    return Object.keys(db.get('user')).length > 0 ? true : false;
  };


  exportKeys(format, targetFile) {
    log.info('Exporting keys to', targetFile);
    const userDb = db.get('user');
    return userDb.getDoc().then(doc => {
      if (jetpack.exists(targetFile)) {
        throw new Error('File already exists');
      }
      let fileContents;
      if (format !== 'json') {
        throw new Error('Unknown format');
      }
      fileContents = doc.addresses;
      jetpack.write(targetFile, fileContents);
    });
  };


  importKeys(data) {
    log.info('Importing keys from file');
    let keys = JSON.parse(data);
    const userDb = db.get('user');
    return userDb.getDoc().then(doc => {
      for (let type of env.addressTypes) {
        if (!keys[type]) {
          continue;
        }
        for (let addressId in keys[type]) {
          const address = keys[type][addressId];
          for (let key of env.importRequiredKeys) {
            if (!(key in address)) {
              throw new Error('Missing key ' + key);
            }
          }
          address.label = address.label || '';
          address.category = address.category || 'default';
        }
        Object.assign(doc.addresses[type], keys[type]);
      }
      return userDb.update({
        addresses: doc.addresses,
      });
    });
  };


};


module.exports = User;
