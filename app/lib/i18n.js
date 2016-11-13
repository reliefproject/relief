(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const i18nDir = path.join(__dirname, '..', 'common', 'i18n');


  const loadStrings = function(lang, filename) {
    return new Promise(function(resolve, reject) {
      const msgDir = path.join(i18nDir, lang);
      if (!jetpack.exists(msgDir)) {
        return reject('Unknown language');
      }
      const file = path.join(i18nDir, lang, filename + '.json');
      if (!jetpack.exists(file)) {
        return reject('File not found');
      }
      const content = JSON.parse(
        jetpack.read(file)
      );
      if (Object.keys(content).length === 0) {
        return reject('No translations found');
      }
      resolve(content);
    });
  };

  module.exports = {
    loadStrings: loadStrings,
  };

})();
