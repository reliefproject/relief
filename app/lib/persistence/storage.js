module.exports = function(options) {

  const jetpack = require('fs-jetpack');
  const Datastore = require('nedb');
  const aes = require('../crypto/aes');
  const env = require('../env');

  let db = {};

  /**
   * Options:
   * id (app, servers, user)
   * filename (required)
   * createIfNotExists (default false)
   * encryptionKey
   * Other nedb options, see
   * https://github.com/louischatriot/nedb
   */

  if (env.storages.indexOf(options.id) == -1) {
    return new Error('Unknown storage ' + options.id);
  }

  if (!jetpack.exists(options.filename) && !options.createIfNotExists) {
    return new Error('Database does not exist');
  }

  if (options.encryptionKey) {
    options.afterSerialization = function(data) {
      return aes.encryptData(data, options.encryptionKey);
    };
    options.beforeDeserialization = function(data) {
      return aes.decryptData(data, options.encryptionKey);
    };
  }

  if (options.id === 'user' && !options.createIfNotExists) {
    const encrypted = jetpack.read(options.filename);
    try {
      JSON.parse(
        aes.decryptData(encrypted, options.encryptionKey)
      );
    } catch (e) {
      return new Error('Cannot decrypt database');
    }
  }

  options.autoload = true;

  jetpack.file(options.filename);

  db = new Datastore(options);

  this.getDoc = function(callback) {
    db.findOne({ _id: options.id }, callback);
  };

  this.insertDoc = function(doc, callback) {
    doc._id = options.id;
    db.insert(doc, callback)
  };

  this.update = function(values, callback) {
    db.update({ _id: options.id }, { $set: values }, {}, callback);
  };

  this.updateDoc = function(doc, callback) {
    console.log('test')
    console.log(options.id)
    db.update({ _id: options.id }, doc, {}, callback);
  };

  this.upsert = function(doc, callback) {
    db.update({ _id: options.id }, doc, { upsert: true }, callback);
  };

  return this;
};
