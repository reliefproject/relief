(function() {

  app.filter('nxtTime', function() {
    return function(timestamp) {
      if (isNaN(timestamp)) {
        return '';
      }
      const genesisTime = 1385294400;
      return new Date((timestamp + genesisTime) * 1000);
    };
  });

})();
