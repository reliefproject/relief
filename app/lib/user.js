(function() {

  const crypto = require('crypto');
  const uuid = require('node-uuid');
  const async = require('async');

  const env = require('./env');
  const log = require('./log');
  const blockchain = require('./blockchain/blockchain');
  const persistence = require('./persistence/persistence');

  const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      env.pbkdf2Iterations,
      env.pbkdf2Keylen,
      env.pbkdf2Digest
    );
  };


  const login = function(username, password, callback) {
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      if (!doc.users[username]) {
        return callback(new Error('Unknown user'));
      }
      const salt = doc.users[username].salt;
      const key = getHash(password, salt);
      persistence.initUserDb(username, key, onInitUserDb);
    };
    const onInitUserDb = function(err) {
      if (err) {
        return callback(err);
      }
      callback();
    };
    persistence.db.app.getDoc(onGetDoc);
  };


  const logout = function(callback) {
    persistence.unsetUserDb(callback);
  };


  const isLoggedIn = function() {
    return Object.keys(persistence.db.user).length > 0;
  };


  const createAccount = function(userData, callback) {
    let appData = {};
    const salt = uuid.v4();
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      appData = doc;
      if (!appData.users) {
        appData.users = {};
      }
      if (appData.users[userData.username] !== undefined) {
        return callback(new Error('User already exists'));
      }
      const key = getHash(userData.password, salt);
      persistence.createUserDb(
        userData.username,
        key,
        onCreateUserDb
      );
    };
    const onCreateUserDb = function(err) {
      if (err) {
        return callback(err);
      }
      const user = {
        username: userData.username,
        salt: salt,
      };
      appData.users[userData.username] = user;
      persistence.db.app.updateDoc(appData, onUpdateDoc);
    };
    const onUpdateDoc = function(err) {
      if (err) {
        return callback(err);
      }
      persistence.db.user.update(
        { username: userData.username },
        callback
      );
    };
    persistence.db.app.getDoc(onGetDoc);
  };


  const getBalances = function(callback) {
    let balances = {};
    const onGetNXTBalances = function(err, data) {
      if (err) {
        return callback(err);
      }
      balances.nxt = data;
      getAssetBalances(onGetAssetBalances);
    };
    const onGetAssetBalances = function(err, data) {
      if (err) {
        return callback(err);
      }
      balances.assets = data;
      getCurrencyBalances(onGetCurrencyBalances);
    };
    const onGetCurrencyBalances = function(err, data) {
      if (err) {
        return callback(err);
      }
      balances.currencies = data;
      balances.total = {
        assets: {},
        currencies: {},
      };
      // NXT Total
      for (var i in balances.nxt) {
        if (!balances.total.nxt) {
          balances.total.nxt = {
            confirmed: 0,
            unconfirmed: 0,
          };
        }
        const bal = balances.nxt[i];
        balances.total.nxt.confirmed += bal.confirmed;
        balances.total.nxt.unconfirmed += bal.unconfirmed;
      }
      // Assets Total
      for (var k in balances.assets) {
        const asset = balances.assets[k];
        if (!balances.total.assets[k]) {
          balances.total.assets[k] = {
            confirmed: 0,
            unconfirmed: 0,
          };
        }
        for (var i in asset) {
          const bal = asset[i];
          balances.total.assets[k].confirmed += bal.confirmed;
          balances.total.assets[k].unconfirmed += bal.unconfirmed;
        }
      }
      // Currency Total
      for (var k in balances.currencies) {
        const currency = balances.currencies[k];
        if (!balances.total.currencies[k]) {
          balances.total.currencies[k] = {
            confirmed: 0,
            unconfirmed: 0,
          };
        }
        for (var i in currency) {
          const bal = currency[i];
          balances.total.currencies[k].confirmed += bal.confirmed;
          balances.total.currencies[k].unconfirmed += bal.unconfirmed;
        }
      }
      callback(null, balances);
    };
    getNXTBalances(onGetNXTBalances);
  };


  const getNXTBalances = function(callback) {
    persistence.db.user.getDoc(function(err, doc) {
      if (err) {
        return callback(err);
      }
      let balances = [];
      async.each(doc.addresses, function(addr, callback) {
        if (addr.type !== 'nxt') {
          return callback();
        }
        blockchain.getCoinBalance(addr.type, addr.address, function(err, data) {
          if (err) {
            return callback(err);
          }
          data.address = addr.address;
          data.label = addr.label;
          balances.push(data);
          callback();
        });
      }, function(err) {
        callback(err, balances);
      });
    });
  };

  const getAssetBalances = function(callback) {
    persistence.db.user.getDoc(function(err, doc) {
      if (err) {
        return callback(err);
      }
      let balances = {};
      async.each(doc.addresses, function(addr, callback) {
        if (addr.type !== 'nxt') {
          return callback();
        }
        const req = {
          requestType: 'getAccountAssets',
          includeAssetInfo: true,
          account: addr.address,
        };
        blockchain.bc.nxt.client.request(req, function(err, result) {
          if (err || !result.data.accountAssets) {
            return callback(err);
          }
          for (let i in result.data.accountAssets) {
            const asset = result.data.accountAssets[i];
            const assetId = asset.asset;
            if (!balances[assetId]) {
              balances[assetId] = [];
            }
            asset.confirmed = parseInt(asset.quantityQNT);
            asset.unconfirmed = asset.confirmed - parseInt(asset.unconfirmedQuantityQNT);
            asset.address = addr.address;
            balances[assetId].push(asset);
          }
          callback();
        });
      }, function(err) {
        callback(err, balances);
      });
    });
  };

  const getCurrencyBalances = function(callback) {
    persistence.db.user.getDoc(function(err, doc) {
      if (err) {
        return callback(err);
      }
      let balances = {};
      async.each(doc.addresses, function(addr, callback) {
        if (addr.type !== 'nxt') {
          return callback();
        }
        const req = {
          requestType: 'getAccountCurrencies',
          includeCurrencyInfo: true,
          account: addr.address,
        };
        blockchain.bc.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          for (let i in result.data.accountCurrencies) {
            const currency = result.data.accountCurrencies[i];
            const currencyId = currency.code;
            if (!balances[currencyId]) {
              balances[currencyId] = [];
            }
            currency.confirmed = parseInt(currency.units);
            currency.unconfirmed = currency.confirmed - parseInt(currency.unconfirmedUnits);
            currency.address = addr.address;
            balances[currencyId].push(currency);
          }
          callback();
        });
      }, function(err) {
        callback(err, balances);
      });
    });
  };

  module.exports = {
    login: login,
    logout: logout,
    isLoggedIn, isLoggedIn,
    createAccount: createAccount,
    getBalances: getBalances,
  };

})();
