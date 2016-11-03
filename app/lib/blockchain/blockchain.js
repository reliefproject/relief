(function() {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const Btc = require('./btc_electrum');
  const Nxt = require('./nxt_nrs');

  let tasks = [];
  let bc = {
    btc: {},
    nxt: {},
  };

  const init = function(callback) {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const electrumFile = path.join(dataDir, 'servers_electrum.json');
    const nxtFile = path.join(dataDir, 'servers_nxt.json');

    const electrumList = jetpack.read(electrumFile, 'json');
    const nxtList = jetpack.read(nxtFile, 'json');
    bc.btc = new Btc(electrumList);
    bc.nxt = new Nxt(nxtList);

    tasks.push({
      name: 'btcNumBlocks',
      interval: 10000,
      type: 'btc',
      command: 'blockchain.numblocks.subscribe',
      params: [],
      callback: function(err, resp) {
        Relief.emit('btc.BlockHeight', resp.data.result);
      },
    });
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
        case 'btc': {
          const data = JSON.stringify({
            id: 1,
            method: task.command,
            params: task.params,
          });
          bc.btc.client.request(data, task.callback);
          tasks[i].lastRun = now;
          break;
        }
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
      case 'btc': {
        const req = {
          id: 1,
          method: 'blockchain.address.get_balance',
          params: [address],
        };
        bc.btc.client.request(req, function(err, result) {
          if (err) {
            return callback(err);
          }
          callback(null, {
            confirmed: result.data.result.confirmed,
            unconfirmed: result.data.result.unconfirmed,
          });
        });
        break;
      }
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
