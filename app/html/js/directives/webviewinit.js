app.directive('webviewinit', function() {
  return {
    link: function(scope, element, attrs) {

      element.bind('did-start-loading', function(e) {
        this.addEventListener('console-message', e => {
          Relief.log.info(
            'Console message from plugin',
            element.attr('id')
          );
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
      });

      element.bind('dom-ready', e => {
        Relief.emit('webview.ready', element.attr('id'));
      });

    },
  }
});
