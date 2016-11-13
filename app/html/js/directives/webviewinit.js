(function() {

  app.directive('webviewinit', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        element.bind('did-finish-load', function(e) {
          this.addEventListener('console-message', function(e) {
            if (e.level === 0) {
              Relief.log.info(e.message);
            }
            if (e.level === 1) {
              Relief.log.warn(e.message);
            }
            if (e.level === 2) {
              Relief.log.error(e.message);
            }
          });
          if (Relief.env.name === 'development') {
            this.openDevTools();
          }
        });
      },
    }
  });

})();
