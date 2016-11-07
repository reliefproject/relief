(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const i18nDir = path.join('app', 'html', 'i18n');

  const loadStrings = function(lang, filename, callback) {
    const msgDir = path.join(i18nDir, lang);
    if (!jetpack.exists(msgDir)) {
      return callback(new Error('Unknown language'));
    }
    const file = path.join(i18nDir, lang, filename + '.json');
    if (!jetpack.exists(file)) {
      return callback(new Error('File not found'));
    }
    const content = JSON.parse(
      jetpack.read(file)
    );
    return Object.keys(content).length > 0
      ? callback(null, content)
      : callback(new Error('No translations found'));
  };

  module.exports = {
    loadStrings: loadStrings,
  };

})();
