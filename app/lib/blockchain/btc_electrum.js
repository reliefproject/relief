module.exports = function(options) {

  const shortHash = require('short-hash');
  const ElectrumClient = require('electrum-wrapper');
  const persistence = require('../persistence/persistence');
  const log = require('../log');

  const client = new ElectrumClient(options);

  client.on('error', function(err) {
    log.error(err);
  });

  this.getServerList = function(callback) {
    client.request('server.peers.subscribe', [], function(data) {
      if (!data || typeof data !== 'object') {
        return callback(new Error('Could not get server list'));
      }
      const serverList = data.result;
      let newDoc = {
        electrum: {},
      };
      for (let i in serverList) {
        const ip = serverList[i][0];
        const host = serverList[i][1];
        const params = serverList[i][2];
        const version = params[0];
        const limit = params[1].substr(1);
        let protocol;
        let port;
        for (let j = 2; j < params.length; j++) {
          switch (params[j].charAt(0)) {
            case 't': {
              protocol = 'tcp';
              port = 50001;
              break;
            }
            case 's': {
              protocol = 'tls';
              port = 50002;
              break;
            }
            case 'h': {
              protocol = 'http';
              port = 8081;
              break;
            } case 'g': {
              protocol = 'https';
              port = 8082;
              break;
            }
          }

          // Non-standard port
          if (params[j].substr(1)) {
            port = params[j].substr(1);
          }
        }
        const key = shortHash(protocol + host);
        newDoc.electrum[key] = {
          protocol: protocol,
          host: host,
          ip: ip,
          port: port,
          version: version,
          limit: limit,
        };
      }
      callback(null, newDoc);
    });
  };

  // Passthrough function
  this.request = client.request;

  return this;
};
