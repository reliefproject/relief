const jetpack = require('fs-jetpack');
const Datastore = require('nedb');
const aes = require('../crypto/aes');
const env = require('../env');


class Store {


  constructor(options) {
    this.db = {};
    const key = options.encryptionKey;
    if (key) {
      options.afterSerialization = data => aes.encryptData(data, key);
      options.beforeDeserialization = data => aes.decryptData(data, key);
      if (
        !options.createIfNotExists &&
        !this.canDecrypt(options.filename, key)
      ) {
        throw new Error('Invalid decryption key');
      }
    }
    options.autoload = true;
    if (!jetpack.exists(options.filename) && !options.createIfNotExists) {
      throw new Error('DB not found at ' + options.filename);
    }
    jetpack.file(options.filename);
    this.options = options;
    this.db = new Datastore(options);
  };


  canDecrypt(file, key) {
    const contents = jetpack.read(file);
    const lines = contents.trim().split('\n');
    const lastLine = lines.slice(-1)[0];
    try {
      JSON.parse(
        aes.decryptData(lastLine, key)
      );
      return true;
    } catch (e) {
      return false;
    }
  };


  getDoc() {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: this.options.id }, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  };


  insertDoc(doc) {
    return new Promise((resolve, reject) => {
      doc._id = this.options.id;
      this.db.insert(doc, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  update(values) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: this.options.id }, { $set: values }, {}, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  updateDoc(doc) {
    return new Promise((resolve, reject) => {
      doc._id = this.options.id;
      this.db.update({ _id: this.options.id }, doc, {}, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


  upsert(doc) {
    return new Promise((resolve, reject) => {
      doc._id = this.options.id;
      this.db.update({ _id: this.options.id }, doc, { upsert: true }, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };


};


module.exports = Store;
