(function() {


  module.exports = function(options) {


    const jetpack = require('fs-jetpack');
    const Datastore = require('nedb');
    const aes = require('../crypto/aes');
    const env = require('../env');


    let db = {};
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
      const contents = jetpack.read(options.filename);
      const lines = contents.trim().split('\n');
      const lastLine = lines.slice(-1)[0];
      try {
        JSON.parse(
          aes.decryptData(lastLine, options.encryptionKey)
        );
      } catch (e) {
        return new Error('Cannot decrypt database');
      }
    }
    options.autoload = true;
    jetpack.file(options.filename);
    db = new Datastore(options);


    this.getDoc = function() {
      return new Promise(function(resolve, reject) {
        db.findOne({ _id: options.id }, function(err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };


    this.insertDoc = function(doc) {
      return new Promise(function(resolve, reject) {
        doc._id = options.id;
        db.insert(doc, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    };


    this.update = function(values) {
      return new Promise(function(resolve, reject) {
        db.update({ _id: options.id }, { $set: values }, {}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    };


    this.updateDoc = function(doc) {
      return new Promise(function(resolve, reject) {
        doc._id = options.id;
        db.update({ _id: options.id }, doc, {}, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    };


    this.upsert = function(doc) {
      return new Promise(function(resolve, reject) {
        doc._id = options.id;
        db.update({ _id: options.id }, doc, { upsert: true }, function(err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    };


    return this;

  };

})();
