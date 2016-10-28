module.exports = function(Relief) {

  const Btc = require('./btc_electrum');
  const Nxt = require('./nxt_nrs');

  let bc = {
    btc: {},
    nxt: {},
  };

  this.init = function(callback) {

    let serverList = {};
    const onGetDoc = function(err, doc) {
      if (err) {
        return callback(err);
      }
      doc = !doc
        ? { servers: { electrum: {}, nxt: {}, }, }
        : doc;

      let initServers = {};
      initServers.electrum = Object.keys(doc.servers.electrum).length > 0
        ? doc.servers.electrum
        : Relief.env.bootstrapServers.electrum;
      initServers.nxt = Object.keys(doc.servers.nxt).length > 0
        ? doc.servers.nxt
        : Relief.env.bootstrapServers.nxt;
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
