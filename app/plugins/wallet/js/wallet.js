(function() {

  const app = angular.module(
    'Wallet', []
  );

  app.controller('MainCtrl', function($scope, $timeout) {

    let appData;
    $scope.strings = {};
    $scope.page = 'balances';

    $scope.setPage = function(page) {
      $scope.page = page;
    }

    //$timeout(function() { $scope.page = 'keys'; }, 5000)
    /*
        Relief.persistence.db.app.getDoc(function(err, data) {
          if (err) {
            return Relief.log.error(err);
          }
          if (data) {
            appData = data;
          }

          // Get data
        });

        Relief.i18n.loadStrings(language, function(err, strings) {
          if (err) {
            return Relief.log.error(err);
          }
        });
    */
  });

})();
