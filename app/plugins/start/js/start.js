(function() {

  const app = angular.module(
    'Start',
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
    $scope.create = {
      language: '',
      username: '',
      password1: '',
      password2: '',
    };

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
          serverData = data;
        }
        // Remembered servers
        if (Object.keys(appData.servers.electrum).length > 0) {
          $scope.login.electrum = appData.servers.electrum;
        } else {
          // TODO Server selection logic
          var key = Object.keys(serverData.electrum)[0];
          $scope.login.electrum = serverData.electrum[key];
        }
        if (Object.keys(appData.servers.nxt).length > 0) {
          $scope.login.nxt = appData.servers.nxt;
        } else {
          // TODO Server selection logic
          var key = Object.keys(serverData.nxt)[0];
          $scope.login.nxt = serverData.nxt[key];
        }
        // Stupid, TODO fix
        if ($scope.login.nxt.hostname) {
          $scope.login.nxt.host = $scope.login.nxt.hostname;
          delete $scope.login.nxt.hostname;
          $scope.login.nxt.protocol = $scope.login.nxt.protocol.slice(0, -1);
        }
        $scope.$apply();
        // This will trigger the main window to show
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
          $scope.strings = strings.start;
          $scope.$apply();
          Relief.events.emit('languageChanged', language);
        });
      });
    };
    $scope.$watch('login.language', languageChanged);
    $scope.$watch('create.language', languageChanged);

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

      var serverFields = [
        'electrumProtocol',
        'electrumHost',
        'electrumPort',
        'nxtProtocol',
        'nxtHost',
        'nxtPort',
      ];
      for (let i in serverFields) {
        const key = serverFields[i];
        if ($scope.forms.loginForm[key].$invalid) {
          $scope.forms.loginForm.err = $scope.strings.LOGIN_ERROR_SERVER;
          return;
        }
      }

      if (!$scope.forms.loginForm.$valid) {
        $scope.forms.loginForm.err = $scope.strings.LOGIN_ERROR_FAILED;
        return;
      }

      // Client-side validation passed
      Relief.user.login(
        $scope.login.username,
        $scope.login.password,
        function(err) {
          if (err) {
            $scope.forms.loginForm.$invalid = true;
            $scope.forms.loginForm.err = $scope.strings.LOGIN_ERROR_FAILED;
            $scope.$apply();
            return Relief.log.error(err);
          }
          // Set servers for current session
          Relief.blockchain.setServers({
            electrum: $scope.login.electrum,
            nxt: $scope.login.nxt,
          });
          // Remember servers
          let updateServers = {};
          if ($scope.login.electrum.remember) {
            updateServers['servers.electrum'] = $scope.login.electrum;
          }
          if ($scope.login.nxt.remember) {
            updateServers['servers.nxt'] = $scope.login.nxt;
          }
          if (Object.keys(updateServers).length > 0) {
            Relief.persistence.db.app.update(updateServers, function(err) {
              if (err) {
                Relief.log.error(err);
              }
            });
          }
          Relief.events.emit('loggedIn');
        }
      );
    };

    /**
     * Submit Create Account Form
     */
    $scope.submitCreateForm = function() {

      // Passwords do not match
      if ($scope.create.password1 !== $scope.create.password2) {
        $scope.forms.createForm.err = $scope.strings.CREATE_ERROR_MATCH;
        return;
      }

      if (!$scope.forms.createForm.username.$valid) {
        $scope.forms.createForm.err = $scope.strings.CREATE_ERROR_USERNAME;
      }

      if (!$scope.forms.createForm.password1.$valid) {
        $scope.forms.createForm.err = $scope.strings.CREATE_ERROR_PASSWORD;
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
            $scope.forms.createForm.$invalid = true;
            $scope.forms.createForm.err = $scope.strings.CREATE_ERROR_NAMETAKEN;
            $scope.$apply();
            return Relief.log.error(err);
          }
          $scope.selectedTab = 'login';
          $scope.createAccountSuccess = true;
          $scope.$apply();
        });
      }
    };

  });

})();
