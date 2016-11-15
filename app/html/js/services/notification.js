(function() {

  const moment = require('moment');
  const uuid = require('uuid');


  app.service('Notification', function() {
    let service = {
      queue: [],


      addToQueue: function(options) {
        options.id = uuid.v4();
        moment.locale(options.locale);
        options.time = moment().format('LT');
        options.type = (Relief.env.notificationTypes.indexOf(options.type) !== -1)
          ? options.type
          : 'default';
        if (!options.message) {
          return;
        }
        service.queue.push(options)
      },


      removeFirstElement: function() {
        const rest = service.queue.slice(1);
        service.queue.length = 0;
        return service.queue.push.apply(service.queue, rest);
      },


      readQueue: function* () {
        while(true) {
          if (service.queue[0]) {
            yield service.queue[0];
            this.removeFirstElement();
          } else {
            yield null;
          }
        }
      },


    };

    return service;

  });

})();
