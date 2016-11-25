app.service('i18n', function() {

  let service = {

    strings: {},

    load: (lang, files) => {
      const translations = Relief.i18n.load(lang, files);
      Object.assign(
        service.strings,
        translations[Relief.env.defaultLanguage],
        translations[lang]
      );
    },

    format: Relief.util.format,

    getCategoryTitle: (cat) => {
      const key = 'CATEGORY_' + cat.toUpperCase();
      return service.strings[key];
    },

  };

  return service;

});
