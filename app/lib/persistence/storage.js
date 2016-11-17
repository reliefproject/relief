module.exports = function(options) {

  const jetpack = require('fs-jetpack');
  const Datastore = require('nedb');
  const aes = require('../crypto/aes');
  const env = require('../env');


  let db = {};
  if (options.encryptionKey) {
    options.afterSerialization = function(data) {
      return aes.encryptData(data, options.encryptionKey);
    };
    options.beforeDeserialization = function(data) {
      return aes.decryptData(data, options.encryptionKey);
    };
  }
  if (options.id === 'user' && !options.createIfNotExists) {
    const contents = jetpack.read(options.filename);
    const lines = contents.trim().split('\n');
    const lastLine = lines.slice(-1)[0];
    try {
      JSON.parse(
        aes.decryptData(lastLine, options.encryptionKey)
      );
    } catch (e) {
      throw new Error('Cannot decrypt database');
    }
  }
  options.autoload = true;
  jetpack.file(options.filename);
  db = new Datastore(options);


  this.getDoc = () => {
    return new Promise((resolve, reject) => {
      db.findOne({ _id: options.id }, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  };


  this.insertDoc = doc => {
    return new Promise((resolve, reject) => {
      doc._id = options.id;
      db.insert(doc, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  this.update = values => {
    return new Promise((resolve, reject) => {
      db.update({ _id: options.id }, { $set: values }, {}, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  this.updateDoc = doc => {
    return new Promise((resolve, reject) => {
      doc._id = options.id;
      db.update({ _id: options.id }, doc, {}, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  this.upsert = doc => {
    return new Promise((resolve, reject) => {
      doc._id = options.id;
      db.update({ _id: options.id }, doc, { upsert: true }, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  return this;

};
