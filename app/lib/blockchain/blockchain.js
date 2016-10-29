module.exports = function(Relief) {

  const Btc = require('./btc_electrum');
  const Nxt = require('./nxt_nrs');

  let bc = {
    btc: {},
    nxt: {},
  };

  this.setServers = function(params, callback) {
    if (params.electrum) {
      bc.btc = new Btc(params.electrum);
      Relief.log.info('Set server:', params.electrum);
    }
    if (params.nxt) {
      bc.nxt = new Nxt(params.nxt);
      Relief.log.info('Set server:', params.nxt);
    }
  };

  this.init = function(callback) {
    let serverList = {};
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      if (!doc) {
        doc = Relief.env.bootstrapServers;
      }
      if (!doc.electrum) {
        doc.electrum = Relief.env.bootstrapServers.electrum;
      }
      if (!doc.nxt) {
        doc.nxt = Relief.env.bootstrapServers.nxt;
      }
      this.setServers(doc);
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
      Relief.persistence.db.servers.upsert(serverList, onUpdateServerList);
    };

    const onUpdateServerList = function(err) {
      if (err) {
        return callback(err);
      }
      callback();
    };

    Relief.persistence.db.app.getDoc(onGetDoc);
  };

  return this;
};
