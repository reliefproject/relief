app.service('i18n', function() {
  let service = {
    strings: {},

    loadStrings: language => {
      return Relief.i18n.loadStrings(language, 'browser')
      .then(strings => {
        service.strings = strings;
      });
    },

  };

  return service;

});
