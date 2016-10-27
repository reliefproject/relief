module.exports = function(options) {

  const jetpack = require('fs-jetpack');
  const Datastore = require('nedb');
  const aes = require('../crypto/aes');

  /**
   * Options:
   * filename (required)
   * createIfNotExists (default false)
   * encryptionKey
   * Other nedb options, see
   * https://github.com/louischatriot/nedb
   */

  if (!jetpack.exists(options.filename) && !options.createIfNotExists) {
    return null;
  }

  if (options.encryptionKey) {
    options.afterSerialization = function(data) {
      return aes.encryptData(data, options.encryptionKey);
    };
    options.beforeDeserialization = function(data) {
      return aes.decryptData(data, options.encryptionKey);
    };
  }

  options.autoload = true;
  jetpack.file(options.filename);

  return new Datastore(options);
};
