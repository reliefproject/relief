(function() {

  app.service('i18n', function() {
    var service = {
      strings: {},
      loadStrings: function(language, callback) {
        Relief.i18n.loadStrings(language, 'wallet', function(err, strings) {
          if (err) {
            return callback(err);
          }
          service.strings = strings.wallet;
          callback();
        });
      },
      getCategoryTitle: function(cat) {
        const key = 'CATEGORY_' + cat.toUpperCase();
        return service.strings[key];
      },
    };
    return service;
  });

})();
