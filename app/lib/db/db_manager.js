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
    this.stores[store] = new Store({
      id: store,
      filename: this.path(store, credentials.username),
      encryptionKey: credentials.key,
      createIfNotExists: create,
    });
  };


  get(store) {
    return this.stores[store];
  };


  unset(store) {
    this.stores[store] = {};
  };


};


module.exports = DbManager;
