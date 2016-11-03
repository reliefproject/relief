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
      delete userData.password;
      persistence.db.user.insertDoc(userData, callback);
    };
    persistence.db.app.getDoc(onGetDoc);
  };

  const getBalances = function(callback) {

    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      let balances = {
        btc: [],
        nxt: [],
        total: {
          btc: { confirmed: 0, unconfirmed: 0 },
          nxt: { confirmed: 0, unconfirmed: 0 },
        },
      };
      async.each(doc.addresses, function(addr, callback) {
        if (addr.type === 'btc') {
          const req = {
            id: 1,
            method: 'blockchain.address.get_balance',
            params: [addr.address],
          };
          blockchain.bc.btc.client.request(req, function(err, result) {
            if (err) {
              return callback(err);
            }
            balances.btc.push({
              address: addr,
              confirmed: result.data.result.confirmed,
              unconfirmed: result.data.result.unconfirmed,
            });
            callback();
          });
        } else if (addr.type === 'nxt') {
          const req = {
            requestType: 'getBalance',
            account: addr.address,
          };
          blockchain.bc.nxt.client.request(req, function(err, result) {
            if (err) {
              return callback(err);
            }
            const unconf = (
              parseInt(result.data.balanceNQT) -
              parseInt(result.data.unconfirmedBalanceNQT)
            );
            balances.nxt.push({
              address: addr,
              confirmed: parseInt(result.data.balanceNQT),
              unconfirmed: unconf,
            });
            callback();
          });
        }
      }, function(err) {
        for (let i in balances.btc) {
          balances.total.btc.confirmed += balances.btc[i].confirmed;
          balances.total.btc.unconfirmed += balances.btc[i].unconfirmed;
        }
        for (let i in balances.nxt) {
          balances.total.nxt.confirmed += balances.nxt[i].confirmed;
          balances.total.nxt.unconfirmed += balances.nxt[i].unconfirmed;
        }
        callback(err, balances);
      });
    };

    persistence.db.user.getDoc(onGetDoc);
  };

  module.exports = {
    login: login,
    logout: logout,
    isLoggedIn, isLoggedIn,
    createAccount: createAccount,
    getBalances: getBalances,
  };

})();
