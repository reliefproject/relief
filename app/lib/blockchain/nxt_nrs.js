module.exports = function(options) {

  const shortHash = require('short-hash');
  const Nxt = require('nxt-wrapper');
  const persistence = require('../persistence/persistence');
  const log = require('../log');

  const client = new Nxt(options);

  client.on('error', function(err) {
    log.error(err);
  });

  this.getServerList = function(callback) {

    let apiServers = {};
    let apiSslServer = {};
    let params = {
      active: true,
      service: 'API',
      includePeerInfo: true,
    };

    const onGetPeers = function(data) {
      if (!data || typeof data !== 'object') {
        return callback(new Error('Could not get server list'));
      }
      apiServers = data.peers;
      params.service = 'API_SSL';
      client.request('getPeers', params, onGetSslPeers);
    };

    const onGetSslPeers = function(data) {
      if (!data || typeof data !== 'object') {
        return callback(new Error('Could not get server list'));
      }
      apiSslServers = data.peers;

      let newDoc = {
        nxt: {},
      };

      for (let i in apiServers) {
        const key = shortHash(apiServers[i].announcedAddress);
        newDoc.nxt[key] = {
          protocol: 'http',
          ip: apiServers[i].address,
          host: apiServers[i].announcedAddress,
          port: apiServers[i].apiPort,
          version: apiServers[i].version,
        };
      }
      for (let i in apiSslServers) {
        const key = shortHash(apiSslServers[i].announcedAddress);
        newDoc.nxt[key] = {
          protocol: 'https',
          ip: apiSslServers[i].address,
          host: apiSslServers[i].announcedAddress,
          port: apiSslServers[i].apiSSLPort,
          version: apiSslServers[i].version,
        };
      }

      callback(null, newDoc);
    };

    client.request('getPeers', params, onGetPeers);
  };

  // Passthrough function
  this.request = client.request;

  return this;
};
