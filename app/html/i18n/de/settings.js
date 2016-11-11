(function() {

  app.service('Settings', function() {
    let service = {
      settings: {},
      loadSettings: function() {
        return Relief.db.app.getDoc().then(function(data) {
          service.settings = data;
        });
      },
    };
    return service;
  });

})();
