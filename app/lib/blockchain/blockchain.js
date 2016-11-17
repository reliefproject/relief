const log = require('../log');


let instance = null;


class Blockchain {


  constructor() {
    if (instance) {
      return instance;
    }
    this.tasks = [];
    this.chains = {};
    this.runTasks();
    instance = this;
  };


  addChain(name, chain) {
    this.chains[name] = chain;
  };


  addTask(task) {
    this.tasks.push(task);
  };


  runTasks() {
    const now = new Date().getTime();
    for (let i in this.tasks) {
      const task = this.tasks[i];
      if ((now - task.lastRun) < task.interval) {
        continue;
      }
      log.debug('Task', task)
      this.chains[task.type].request(task.command, task.params)
      .then(task.callback, log.error);
      this.tasks[i].lastRun = now;
    }
    setTimeout(() => {
      this.runTasks();
    }, 1000);
  };


};

module.exports = Blockchain;
