const path = require('path');
const jetpack = require('fs-jetpack');
const i18nDir = path.join('app', 'html', 'i18n');

const loadStrings = function(lang, callback) {

  const msgDir = path.join(i18nDir, lang);
  if (!jetpack.exists(msgDir)) {
    return callback(new Error('Unknown language'));
  }

  const files = jetpack.find(msgDir, { matching: '*.json' })
  const i18nStrings = {};
  for (var i in files) {
    const contents = JSON.parse(
      jetpack.read(files[i])
    );
    const key = Object.keys(contents);
    i18nStrings[key] = contents[key];
  }

  return Object.keys(i18nStrings).length > 0
    ? callback(null, i18nStrings)
    : callback(new Error('No translations found'));
};

module.exports = {
  loadStrings: loadStrings,
};
