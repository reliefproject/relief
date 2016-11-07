(function() {

  app.service('Settings', function() {
    var service = {
      settings: {},
      loadSettings: function(callback) {
        Relief.db.app.getDoc(function(err, data) {
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
