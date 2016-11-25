const path = require('path');
const jetpack = require('fs-jetpack');
const nxtjs = require('nxtjs');
const DoubleChecker = require('doublechecker');
const log = require('../log');
const env = require('../env');
const Blockchain = require('./blockchain');


let instance = null;


class Nxt extends Blockchain {


  constructor() {
    super();
    if (instance) {
      return instance;
    }
    this.client = new DoubleChecker({
      numUseSources: env.nxtNumSources,
      dataType: 'json',
      ignoreJSONKeys: env.nxtIgnoreJSONKeys,
      sources: this.getServerList(),
    });
    super.addChain('nxt', this);
    super.addTask({
      name: 'nxtNumBlocks',
      interval: 60000,
      type: 'nxt',
      command: 'getBlockchainStatus',
      params: {},
      callback: resp => {
        Relief.emit('nxt.BlockHeight', (resp.data.numberOfBlocks - 1));
      },
    });
    instance = this;
  };


  getServerList() {
    const file = env.nxtTestnet
      ? 'servers_nxt_testnet.json'
      : 'servers_nxt.json';
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const nxtFile = path.join(dataDir, file);
    return jetpack.read(nxtFile, 'json');
  };


  generateAddress(passphrase) {
    const address = nxtjs.secretPhraseToAccountId(passphrase);
    const numeric = nxtjs.rsConvert(address).account;
    const publicKey = nxtjs.secretPhraseToPublicKey(passphrase);
    return { address, numeric, publicKey, };
  };


  request(command, options) {
    Object.assign(options, { requestType: command });
    log.debug('Nxt request', options);
    return new Promise((resolve, reject) => {
      this.client.request(options, (err, data) => {
        if (err) {
          return reject(err);
        }
        log.debug('Nxt response', data);
        if (data.score < 1) {
          Relief.emit('notify.dataInconsistency', [
            data.frequency,
            Math.round(data.frequency / data.score),
            data.score,
          ]);
        }
        resolve(data);
      });
    });
  };


};


module.exports = Nxt;
