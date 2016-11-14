(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const log = require('./log');
  const i18nDir = path.join(__dirname, '..', 'common', 'i18n');


  const loadStrings = function(lang, filename) {
    return new Promise(function(resolve, reject) {

      const msgDir = path.join(i18nDir, lang);
      if (!jetpack.exists(msgDir)) {
        return reject('Unknown language');
      }
      const file = path.join(msgDir, filename + '.json');
      if (!jetpack.exists(file)) {
        return reject('File not found');
      }

      let strings = {};
      strings = jetpack.read(
        path.join(msgDir, 'common.json'),
        'json'
      );
      const content = JSON.parse(
        jetpack.read(file)
      );
      Object.assign(strings, content);

      resolve(strings);

    });
  };


  module.exports = {
    loadStrings: loadStrings,
  };


})();
