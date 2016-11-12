(function() {

  app.directive('webviewinit', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        element.bind('did-finish-load', function(e) {
          this.addEventListener('console-message', function(e) {
            Relief.log.info(e.message);
          });
          if (Relief.env.name === 'development') {
            this.openDevTools();
          }
        });
      },
    }
  });

})();
