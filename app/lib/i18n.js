(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const env = require('./env');
  const i18nDir = path.join(__dirname, '..', 'common', 'i18n');


  const loadStrings = function(lang, filename) {
    return new Promise(function(resolve, reject) {

      let strings = {};
      const defaultMsgDir = path.join(i18nDir, env.defaultLanguage);
      const defaultFile = path.join(defaultMsgDir, filename + '.json');
      strings = jetpack.read(
        path.join(defaultMsgDir, 'common.json'),
        'json'
      );
      Object.assign(
        strings,
        jetpack.read(defaultFile, 'json')
      );

      const msgDir = path.join(i18nDir, lang);
      const file = path.join(msgDir, filename + '.json');
      const commonFile = path.join(msgDir, 'common.json');
      Object.assign(
        strings,
        jetpack.read(commonFile, 'json')
      );
      Object.assign(
        strings,
        jetpack.read(file, 'json')
      );

      resolve(strings);

    });
  };


  module.exports = {
    loadStrings,
  };


})();
