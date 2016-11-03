//Module.exports = function(Relief) {

const path = require('path');
const jetpack = require('fs-jetpack');
const Btc = require('./btc_electrum');
const Nxt = require('./nxt_nrs');

let btc = {};
let nxt = {};
let tasks = [];

const init = function(callback) {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  const electrumFile = path.join(dataDir, 'servers_electrum.json');
  const nxtFile = path.join(dataDir, 'servers_nxt.json');

  const electrumList = jetpack.read(electrumFile, 'json');
  const nxtList = jetpack.read(nxtFile, 'json');
  btc = new Btc(electrumList);
  nxt = new Nxt(nxtList);

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
        btc.client.request(data, task.callback);
        tasks[i].lastRun = now;
        break;
      }
      case 'nxt': {
        task.params.requestType = task.command;
        nxt.client.request(task.params, task.callback);
        tasks[i].lastRun = now;
        break;
      }
    }
  }
  setTimeout(function() {
    runTasks();
  }, 1000);
};

module.exports = {
  init: init,
  btc: btc,
  nxt: nxt,
};

//  Return this;
//};
