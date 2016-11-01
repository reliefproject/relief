module.exports = function(Relief) {

  const path = require('path');
  const jetpack = require('fs-jetpack');
  const Btc = require('./btc_electrum');
  const Nxt = require('./nxt_nrs');

  this.btc = {};
  this.nxt = {};

  this.init = function() {

    const dataDir = path.join(__dirname, '..', '..', 'data');
    const electrumFile = path.join(dataDir, 'servers_electrum.json');
    const nxtFile = path.join(dataDir, 'servers_nxt.json');

    const electrumList = jetpack.read(electrumFile);
    const nxtList = jetpack.read(nxtFile);

    //Console.log(nxtList)
    this.btc = new Btc(electrumList);
    this.nxt = new Nxt(nxtList);
  };

  return this;
};
