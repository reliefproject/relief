(function() {

  const app = angular.module(
    'Account',
    ['ngSanitize']
  );

  app.controller('MainCtrl', function($scope, $timeout) {

    let serverData = {};
    $scope.strings = {};
    $scope.languages = Relief.env.languages;
    $scope.selectedTab = 'login';
    $scope.forms = {};
    $scope.createAccountSuccess = false;
    $scope.showAdvSettingsLogin = false;
    $scope.servers = {
      electrum: {},
      nxt: {},
    };
    $scope.login = {
      language: '',
      username: '',
      password: '',
      electrum: {
        protocol: '',
        host: '',
        port: '',
        remember: false,
      },
      nxt: {
        protocol: '',
        host: '',
        port: '',
        remember: false,
      },
    };
    $scope.loginErrorUsername = '';
    $scope.loginErrorPassword = '';
    $scope.loginErrorElectrum = '';
    $scope.loginErrorNxt = '';
    $scope.create = {
      language: '',
      username: '',
      password1: '',
      password2: '',
    };
    $scope.createErrorUsername = '';
    $scope.createErrorPassword1 = '';
    $scope.createErrorPassword2 = '';

    let appData = {
      users: {},
      servers: $scope.servers,
    };

    Relief.persistence.db.app.getDoc(function(err, data) {
      if (err) {
        return Relief.log.error(err);
      }
      if (data) {
        appData = data;
      }

      // Show "create account" if there are no users
      if (Object.keys(appData.users).length === 0) {
        $scope.selectedTab = 'create';
      }

      $scope.login.language = appData.language
        ? appData.language
        : Relief.env.defaultLanguage;
      $scope.create.language = $scope.login.language;

      // Put serverlist in scope only when needed to prevent
      // Performance issues
      $scope.showingServerList = function() {
        $scope.servers = serverData;
      };
      $(document.body).on('hidden.bs.modal', function() {
        $scope.servers = {};
      });

      // Get server lists
      Relief.persistence.db.servers.getDoc(function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        if (data) {
          //$scope.servers = data;
          serverData = data;
        }
        // Remembered servers
        if (Object.keys(appData.servers.electrum) > 0) {
          $scope.login.electrum = appData.servers.electrum;
        } else {
          // TODO Server selection logic
          var key = Object.keys(serverData.electrum)[0];
          $scope.login.electrum = serverData.electrum[key];
        }
        if (Object.keys(appData.servers.nxt) > 0) {
          $scope.login.nxt = appData.servers.nxt;
        } else {
          // TODO Server selection logic
          var key = Object.keys(serverData.nxt)[0];
          $scope.login.nxt = serverData.nxt[key];
        }
        $scope.$apply();
        // Wait for language strings to load
        $timeout(function() {
          Relief.events.emit('loadingComplete');
        }, 500);
      });
    });

    /**
     * Load lanuage strings when user switches language
     */
    var languageChanged = function(language) {
      if (!language) {
        return;
      }
      appData.language = language;
      Relief.persistence.db.app.upsert(appData, function() {
        Relief.i18n.loadStrings(language, function(err, strings) {
          if (err) {
            return Relief.log.error(err);
          }
          $scope.login.language = language;
          $scope.create.language = language;
          $scope.strings = strings.account;
          $scope.$apply();
          Relief.events.emit('languageChanged', language);
        });
      });
    };
    $scope.$watch('login.language', languageChanged);
    $scope.$watch('create.language', languageChanged);

    /**
     * Reset "submitted" state when user corrects form input
     */
    $scope.$watch('forms.loginForm.$valid', function(validity) {
      $timeout(function() {
        if (validity) {
          $scope.forms.loginForm.$submitted = false;
        }
      });
    });

    /**
     * Select servers
     */
    $scope.selectElectrumServer = function(server) {
      $scope.login.electrum = server;
    };
    $scope.selectNxtServer = function(server) {
      $scope.login.nxt = server;
    };

    /**
     * Submit Login Form
     */
    $scope.submitLoginForm = function() {
      // Set all fields to "touched"
      angular.forEach($scope.forms.loginForm.$error.required, function(field) {
        field.$setTouched();
      });

      // Open 'server settings' if one of the fields has an error
      var serverFields = [
        'electrumProtocol',
        'electrumHost',
        'electrumPort',
        'nxtProtocol',
        'nxtHost',
        'nxtPort',
      ];

      for (var i in serverFields) {
        var key = serverFields[i];
        if ($scope.forms.loginForm[key].$invalid) {
          $scope.showAdvSettingsLogin = true;
        }
      }
      console.log($scope.forms.loginForm.$valid)
      // Client-side validation passed
      if ($scope.forms.loginForm.$valid) {
        // Do stuff
        Relief.user.login(
          $scope.login.username,
          $scope.login.password,
          function(err) {
            console.log('ok')
            if (err) {
              alert('fail');
              return;
            }
            Relief.events.emit('loggedIn');
          }
        );
      }
    };

    /**
     * Submit Create Account Form
     */
    $scope.submitCreateForm = function() {

      // Set all fields to "touched"
      angular.forEach($scope.forms.createForm.$error.required, function(field) {
        field.$setTouched();
      });

      // Passwords do not match
      if ($scope.create.password1 !== $scope.create.password2) {
        $scope.forms.createForm.password2.$setValidity(
          'forms.createForm.password2.$error.match',
          false
        );
        $scope.forms.createForm.password2.$setTouched();
      } else {
        $scope.forms.createForm.password2.$setValidity(
          'forms.createForm.password2.$error.match',
          true
        );
      }

      // Client-side validation passed
      if ($scope.forms.createForm.$valid) {
        $scope.forms.createForm.password2.$setUntouched();
        Relief.user.createAccount({
          username: $scope.create.username,
          password: $scope.create.password1,
          // Set other things here
        }, function(err) {
          if (err) {
            // Username taken
            Relief.log.error(err);
            return;
          }
          $scope.selectedTab = 'login';
          $scope.createAccountSuccess = true;
          $scope.$apply();
        });
      }
    };

  });

})();
