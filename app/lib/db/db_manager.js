const { app } = require('electron');
const path = require('path');
const jetpack = require('fs-jetpack');
const env = require('../env');
const Store = require('./store');


let instance = null;


class DbManager {


  constructor() {
    if (instance) {
      return instance;
    }
    this.stores = {};
    jetpack.dir(env.getPath('data'));
    instance = this;
  };


  path(store, username) {
    const filename = username
      ? env.userDbPrefix + username + env.dbSuffix
      : store + env.dbSuffix;
    return path.join(env.getPath('data'), filename);
  };


  init(store, credentials = {}, create = false) {
    if (env.stores.indexOf(store) === -1) {
      return null;
    }
    const file = this.path(store, credentials.username);
    this.stores[store] = new Store({
      id: store,
      filename: file,
      encryptionKey: credentials.key,
      createIfNotExists: create,
    });
    if (store === 'app') {
      this.stores[store].getDoc().then(doc => {
        if (doc === null) {
          const schemaFile = path.join(
            env.getPath('root'), 'data', 'schema_app.json'
          );
          let schema = jetpack.read(schemaFile, 'json');
          return this.stores[store].insertDoc(schema);
        }
      });
    }
  };


  get(store) {
    return this.stores[store];
  };


  unset(store) {
    this.stores[store] = {};
  };


};


module.exports = DbManager;
