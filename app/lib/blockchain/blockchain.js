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


  const init = () => {
    const nxtList = getServerList('nxt');
    bc.nxt = new Nxt(nxtList);
    tasks.push({
      name: 'nxtNumBlocks',
      interval: 60000,
      type: 'nxt',
      command: 'getBlockchainStatus',
      params: {},
      callback: resp => {
        Relief.emit('nxt.BlockHeight', (resp.data.numberOfBlocks - 1));
      },
    });
    runTasks();
  };


  const runTasks = () => {
    const now = new Date().getTime();
    for (let i in tasks) {
      const task = tasks[i];
      if ((now - task.lastRun) < task.interval) {
        continue;
      }
      log.info('Running task', task.name)
      switch (task.type) {
        case 'nxt': {
          task.params.requestType = task.command;
          bc.nxt.request(task.params).then(task.callback, log.error);
          tasks[i].lastRun = now;
          break;
        }
      }
    }
    setTimeout(() => {
      runTasks();
    }, 1000);
  };


  const getServerList = platform => {
    if (platform === 'nxt') {
      const file = env.nxtTestnet
        ? 'servers_nxt_testnet.json'
        : 'servers_nxt.json';
      const dataDir = path.join(__dirname, '..', '..', 'data');
      const nxtFile = path.join(dataDir, file);
      return jetpack.read(nxtFile, 'json');
    }
  };

  module.exports = {
    init,
    bc,
    getServerList,
  };


})();
