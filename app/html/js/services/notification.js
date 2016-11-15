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


      removeFromQueue: function(id) {
        for (let i in service.queue) {
          if (service.queue[i].id === id) {
            delete service.queue[i];
            break;
          }
        }
      },


      readQueue: function* () {
        for (let i = (service.queue.length - 1); i >= 0; i--) {
          if (service.queue[i]) {
            yield service.queue[i];
            this.removeFromQueue(service.queue[i].id);
          }
        }
        return;
      },


    };

    return service;

  });

})();
