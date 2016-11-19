const path = require('path');
const jetpack = require('fs-jetpack');
const env = require('./env');
const i18nDir = path.join(
  env.getPath('common', env.standalone),
  'i18n'
);


const load = (lang, ids) => {

  ids = ids instanceof Array ? ids : [ ids ];

  let strings = {
    [env.defaultLanguage]: {},
    [lang]: {},
  };

  for (lang in strings) {
    for (id of ids) {
      const file = path.join(i18nDir, lang, id + '.json');
      Object.assign(
        strings[lang],
        jetpack.read(file, 'json')
      );
    }
  }

  return strings;
};


module.exports = {
  load,
};
