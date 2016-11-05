(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const env = require('../env');
  const Nxt = require('./nxt_nrs');

  let tasks = [];
  let bc = {
    nxt: {},
  };

  const init = function(callback) {
    const file = env.nxtTestnet
      ? 'servers_nxt_testnet.json'
      : 'server_nxt.json';
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const nxtFile = path.join(dataDir, file);
    const nxtList = jetpack.read(nxtFile, 'json');
    bc.nxt = new Nxt(nxtList);
    tasks.push({
      name: 'nxtNumBlocks',
      interval: 10000,
      type: 'nxt',
      command: 'getBlockchainStatus',
      params: {},
      callback: function(err, resp) {
        Relief.emit('nxt.BlockHeight', (resp.data.numberOfBlocks - 1));
      },
    });
    runTasks();
    callback();
  };

  const runTasks = function() {
    const now = new Date().getTime();
    for (let i in tasks) {
      const task = tasks[i];
      if ((now - task.lastRun) < task.interval) {
        continue;
      }
      switch (task.type) {
        case 'nxt': {
          task.params.requestType = task.command;
          bc.nxt.client.request(task.params, task.callback);
          tasks[i].lastRun = now;
          break;
        }
      }
    }
    setTimeout(function() {
      runTasks();
    }, 1000);
  };


  const getCoinBalance = function(coin, address, callback) {
    switch (coin) {
      case 'nxt': {
        const req = {
          requestType: 'getBalance',
          account: address,
        };
        bc.nxt.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          const conf = parseInt(result.data.balanceNQT);
          const unconf = (conf - parseInt(result.data.unconfirmedBalanceNQT));
          callback(null, {
            confirmed: conf,
            unconfirmed: unconf,
          });
        });
        break;
      }
      default: {
        return callback(new Error('Unknown coin'));
      }
    }
  };

  const getAssetBalance = function(asset, address, callback) {
    const req = {
      requestType: 'getAccountAssets',
      account: address,
      asset: asset,
    };
    bc.nxt.client.request(req, function(err, result) {
      if (err) {
        return callback(err);
      }
      const conf = parseInt(result.data.quantityQNT);
      const unconf = (conf - parseInt(result.data.unconfirmedQuantityQNT));
      callback(null, {
        confirmed: conf,
        unconfirmed: unconf,
      });
    });
  };

  const getCurrencyBalance = function(currency, address, callback) {
    const req = {
      requestType: 'getAccountCurrencies',
      account: address,
      currency: currency,
    };
    bc.nxt.client.request(req, function(err, result) {
      if (err) {
        return callback(err);
      }
      const conf = parseInt(result.data.units);
      const unconf = (conf - parseInt(result.data.unconfirmedUnits));
      callback(null, {
        confirmed: conf,
        unconfirmed: unconf,
      });
    });
  };


  module.exports = {
    init: init,
    bc: bc,
    getCoinBalance: getCoinBalance,
    getAssetBalance: getAssetBalance,
    getCurrencyBalance: getCurrencyBalance,
  };

})();
