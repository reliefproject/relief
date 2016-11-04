(function() {

  app.filter('formatCurrency', function() {
    return function(amount, decimals) {
      if (isNaN(amount)) {
        return '';
      }
      if (decimals === 0 || !decimals) {
        return amount;
      }
      return amount / Math.pow(10, decimals);
    };
  });

})();
