const env = require('../env');
const persistence = require('../persistence/persistence');
const Btc = require('./btc_electrum');
const Nxt = require('./nxt_nrs');

let bc = {
  btc: {},
  nxt: {},
};

const init = function(callback) {

  let serverList = {};
  const onGetDoc = function(err, doc) {
    if (err) {
      return callback(err);
    }
    if (!doc) {
      doc = {
        servers: {
          electrum: {},
          nxt: {},
        },
      };
    }
    let initServers = {};
    initServers.electrum = Object.keys(doc.servers.electrum).length > 0
      ? doc.servers.electrum
      : env.bootstrapServers.electrum;
    initServers.nxt = Object.keys(doc.servers.nxt).length > 0
      ? doc.servers.nxt
      : env.bootstrapServers.nxt;
    bc.btc = new Btc(initServers.electrum);
    bc.nxt = new Nxt(initServers.nxt);
    bc.btc.getServerList(onGetElectrumServerList);
  };

  const onGetElectrumServerList = function(err, list) {
    if (err) {
      return callback(err);
    }
    serverList.electrum = list.electrum;
    bc.nxt.getServerList(onGetNxtServerList);
  };

  const onGetNxtServerList = function(err, list) {
    if (err) {
      return callback(err);
    }
    serverList.nxt = list.nxt;
    persistence.db.servers.updateDoc(serverList, onUpdateServerList);
  };

  const onUpdateServerList = function(err) {
    if (err) {
      return callback(err);
    }
    callback();
  };

  persistence.init(function() {
    persistence.db.app.getDoc(onGetDoc);
  });
};

module.exports = {
  init: init,
};
