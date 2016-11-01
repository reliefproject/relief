module.exports = function(Relief) {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const Btc = require('./btc_electrum');
  const Nxt = require('./nxt_nrs');

  this.btc = {};
  this.nxt = {};
  this.tasks = [];
  this.lastTaskRun = 0;

  this.init = function() {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const electrumFile = path.join(dataDir, 'servers_electrum.json');
    const nxtFile = path.join(dataDir, 'servers_nxt.json');

    const electrumList = jetpack.read(electrumFile, 'json');
    const nxtList = jetpack.read(nxtFile, 'json');
    this.btc = new Btc(electrumList);
    this.nxt = new Nxt(nxtList);

    this.tasks.push({
      name: 'btcNumBlocks',
      interval: 10000,
      type: 'btc',
      command: 'blockchain.numblocks.subscribe',
      params: [],
      callback: function(err, resp) {
        Relief.events.emit('btc.BlockHeight', resp.data.result);
      },
    });
    this.tasks.push({
      name: 'nxtNumBlocks',
      interval: 10000,
      type: 'nxt',
      command: 'getBlockchainStatus',
      params: {},
      callback: function(err, resp) {
        Relief.events.emit('nxt.BlockHeight', (resp.data.numberOfBlocks - 1));
      },
    });
    this.runTasks();
  };

  this.runTasks = function() {
    const now = new Date().getTime();
    for (let i in this.tasks) {
      const task = this.tasks[i];
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
          this.btc.client.request(data, task.callback);
          this.tasks[i].lastRun = now;
          break;
        }
        case 'nxt': {
          task.params.requestType = task.command;
          this.nxt.client.request(task.params, task.callback);
          this.tasks[i].lastRun = now;
          break;
        }
      }
    }
    const parent = this;
    setTimeout(function() {
      parent.runTasks();
    }, 1000);
  };

  return this;
};
