(function() {

  app.service('i18n', function() {
    let service = {
      strings: {},

      loadStrings: function(language) {
        return Relief.i18n.loadStrings(language, 'browser')
        .then(function(strings) {
          service.strings = strings;
        });
      },

    };

    return service;

  });

})();
