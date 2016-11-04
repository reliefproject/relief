(function() {

  app.service('Settings', function() {
    var service = {
      settings: {},
      loadSettings: function(callback) {
        Relief.persistence.db.app.getDoc(function(err, data) {
          if (err) {
            return callback(err);
          }
          service.settings = data;
          callback();
        });
      },
    };
    return service;
  });

})();
