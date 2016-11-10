(function() {


  const path = require('path');
  const jetpack = require('fs-jetpack');
  const env = require('../env');
  const log = require('../log');
  const Nxt = require('./nxt_nrs');


  let tasks = [];
  let bc = {
    nxt: {},
  };


  const init = function() {
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
      callback: function(resp) {
        Relief.emit('nxt.BlockHeight', (resp.data.numberOfBlocks - 1));
      },
    });
    runTasks();
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
          bc.nxt.request(task.params).then(task.callback, log.error);
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
    bc: bc,
  };


})();
