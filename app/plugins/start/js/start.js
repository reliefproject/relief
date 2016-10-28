(function() {

  var appData = {};
  var appDb = { _id: 'appData' };

  var app = angular.module(
    'Account',
    ['ngSanitize']
  );

  /**
   * Main controller
   */
  app.controller('MainCtrl', ['$scope', '$timeout', function($scope, $timeout) {

    $scope.finishedLoading = false;
    angular.element(document).ready(function() {
      $scope.finishedLoading = true;
      $scope.$apply();
    });

    $scope.strings = {};//Relief.messages.account;
    $scope.languages = Relief.env.languages;

    $scope.selectedTab = 'login';
    $scope.createFormStep = 1;
    $scope.createAccountSuccess = false;

    $scope.showAdvSettingsLogin = false;
    $scope.showAdvSettingsCreate = false;

    $scope.servers = {};

    /**
     * Login Form
     */
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

    /**
     * Create Account Form
     */
    $scope.create = {
      language: '',
      username: '',
      password1: '',
      password2: '',
      btcSeed1: '',
      btcSeed2: '',
      nxtPhrase1: '',
      nxtPhrase2: '',
    };

    $scope.createErrorUsername = '';
    $scope.createErrorPassword1 = '';
    $scope.createErrorPassword2 = '';
    $scope.createErrorBtcSeed1 = '';
    $scope.createErrorBtcSeed2 = '';
    $scope.createErrorNxtPhrase1 = '';
    $scope.createErrorNxtPhrase2 = '';


    Relief.persistence.db.app.getDoc(function(err, data) {
      if (err) {
        return Relief.log.error(err);
      }
      const tmpl = {
        users: {},
        servers: {
          electrum: {},
          nxt: {},
        },
      };
      appData = data
        ? data
        : tmpl;

      // Show "create account" if there are no users
      if (Object.keys(appData.users).length === 0) {
        $scope.selectedTab = 'create';
      }

      $scope.login.language = appData.language
        ? appData.language
        : 'en';
      $scope.create.language = $scope.login.language;

      // Get server lists
      Relief.persistence.db.servers.getDoc(function(err, data) {
        if (err) {
          return Relief.log.error(err);
        }
        if (!data) {
          data = { electrum: {}, nxt: {}}
        }
        // Remembered servers
        if (Object.keys(appData.servers.electrum) > 0) {
          $scope.login.electrum = appData.servers.electrum;
        } else {
          // TODO Server selection logic
          var key = Object.keys(data.electrum)[0];
          $scope.login.electrum = data.electrum[key];
        }

        if (Object.keys(appData.servers.nxt) > 0) {
          $scope.login.nxt = appData.servers.nxt;
        } else {
          // TODO Server selection logic
          var key = Object.keys(data.nxt)[0];
          $scope.login.nxt = data.nxt[key];
        }

        // Server lists
        $scope.servers = data;

        //Relief.event.emit('startUpDone');
      });
    });

    /**
     * Generate Passphrases
     */
    Relief.passphrase.generate(12, function(phrase) {
      $scope.create.btcSeed1 = phrase;
    });
    Relief.passphrase.generate(12, function(phrase) {
      $scope.create.nxtPhrase1 = phrase;
    });
    $scope.generateBtcSeed = function() {
      Relief.passphrase.generate(12, function(phrase) {
        $timeout(function() {
          $scope.create.btcSeed1 = phrase;
        });
      });
    };
    $scope.generateNxtPhrase = function() {
      Relief.passphrase.generate(12, function(phrase) {
        $timeout(function() {
          $scope.create.nxtPhrase1 = phrase;
        });
      });
    };

    /**
     * Load lanuage strings when user switches language
     */
    var languageChanged = function(language) {
      if (!language || (language == appData.language)) {
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
            //Relief.event.emit('languageChanged', language);
          });
      });
    };
    $scope.$watch('login.language', languageChanged);
    $scope.$watch('create.language', languageChanged);

    /**
     * Reset "submitted" state when user corrects form input
     */
    $scope.$watch('loginForm.$valid', function(validity) {
      $timeout(function() {
        if (validity) {
          $scope.loginForm.$submitted = false;
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
      angular.forEach($scope.loginForm.$error.required, function(field) {
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
        if ($scope.loginForm[key].$invalid) {
          $scope.showAdvSettingsLogin = true;
        }
      }

      // Client-side validation passed
      if ($scope.loginForm.$valid) {
        // Do stuff
        Relief.session.login(
          $scope.login.username,
          $scope.login.password,
          function(success) {
            if (success) {
              // TODO servers
              Relief.event.emit('loggedIn');
            }
          }
        );
      }
    };

    /**
     * Submit Create Account Form Step 1
     */
    $scope.submitCreateFormStep1 = function() {

      // Set all fields to "touched"
      angular.forEach($scope.createFormStep1.$error.required, function(field) {
        field.$setTouched();
      });

      // Passwords do not match
      if ($scope.create.password1 !== $scope.create.password2) {
        $scope.createFormStep1.password2.$setValidity(
          'createFormStep1.password2.$error.match',
          false
        );
        $scope.createFormStep1.password2.$setTouched();
      } else {
        $scope.createFormStep1.password2.$setValidity(
          'createFormStep1.password2.$error.match',
          true
        );
      }

      // Client-side validation passed
      if ($scope.createFormStep1.$valid) {
        $scope.createFormStep1.password2.$setUntouched();
        $scope.createFormStep++;
      }

    };

    /**
     * Submit Create Account Form Step 2
     */
    $scope.submitCreateFormStep2 = function() {

      // Set all fields to "touched"
      angular.forEach($scope.createFormStep2.$error.required, function(field) {
        field.$setTouched();
      });

      // Client-side validation passed
      if ($scope.createFormStep2.$valid) {
        $scope.createFormStep++;
      }
    };

    /**
     * Submit Create Account Form Step 3
     */
    $scope.submitCreateFormStep3 = function() {

      // Set all fields to "touched"
      angular.forEach($scope.createFormStep3.$error.required, function(field) {
        field.$setTouched();
      });

      // Passphrases do not match
      if ($scope.create.btcSeed1 !== $scope.create.btcSeed2) {
        $scope.createFormStep3.btcSeed.$setValidity(
          'createFormStep3.btcSeed.$error.match',
          false
        );
        $scope.createFormStep3.btcSeed.$setTouched();
      } else {
        $scope.createFormStep3.btcSeed.$setValidity(
          'createFormStep3.btcSeed.$error.match',
          true
        );
      }

      // Client-side validation passed
      if ($scope.createFormStep3.$valid) {
        $scope.createFormStep++;
      }
    };

    /**
     * Submit Create Account Form Step 4
     */
    $scope.submitCreateFormStep4 = function() {

      // Set all fields to "touched"
      angular.forEach($scope.createFormStep4.$error.required, function(field) {
        field.$setTouched();
      });

      // Client-side validation passed
      if ($scope.createFormStep4.$valid) {
        $scope.createFormStep++;
      }

    };

    /**
     * Submit Create Account Form Step 5
     */
    $scope.submitCreateFormStep5 = function() {

      // Set all fields to "touched"
      angular.forEach($scope.createFormStep5.$error.required, function(field) {
        field.$setTouched();
      });

      // Passphrases do not match
      if ($scope.create.nxtPhrase1 !== $scope.create.nxtPhrase2) {
        $scope.createFormStep5.nxtPhrase.$setValidity(
          'createFormStep5.nxtPhrase.$error.match',
          false
        );
        $scope.createFormStep5.nxtPhrase.$setTouched();
      } else {
        $scope.createFormStep5.nxtPhrase.$setValidity(
          'createFormStep5.nxtPhrase.$error.match',
          true
        );
      }

      // Client-side validation passed
      if ($scope.createFormStep5.$valid) {
        $scope.createFormStep++;
      }
    };

    /**
     * Account Creation Wizard End
     */
    $scope.createAccountEnd = function() {
      // TODO BTC/NXT accs
      Relief.session.createUser(
        $scope.create.username,
        $scope.create.password1,
        function(success) {
          if (!success) {
            // TODO error handling
          }
          $timeout(function() {
            $scope.createAccountSuccess = true;
            $scope.selectedTab = 'login';
          });
        }
      );
    };
  },]);

})();
