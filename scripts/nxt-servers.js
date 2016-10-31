const NxtClient = require('nxt-wrapper');

var client = new NxtClient({
  protocol: 'http',
  host: 'de009.static.nxt-nodes.net',
  port: 7876,
  eventLoop: false,
});

getServerList = function() {

    let apiServers = {};
    let apiSslServer = {};
    let params = {
      active: true,
      service: 'API',
      includePeerInfo: true,
    };

    const onGetPeers = function(data) {
      if (!data || typeof data !== 'object') {
        return console.log('Could not get server list');
      }
      apiServers = data.peers;
      params.service = 'API_SSL';
      client.request('getPeers', params, onGetSslPeers);
    };

    const onGetSslPeers = function(data) {
      if (!data || typeof data !== 'object') {
        return console.log('Could not get server list');
      }
      apiSslServers = data.peers;

      let result = [];
      for (let i in apiServers) {
        const server = {
          transport: 'http',
          host: apiServers[i].announcedAddress,
          port: apiServers[i].apiPort,
        };
        result.push(server);
      }
      for (let i in apiSslServers) {
        const server = {
          transport: 'https',
          host: apiSslServers[i].announcedAddress,
          port: apiSslServers[i].apiSSLPort,
        };
        result.push(server);
      }


      for (let i in result) {
        result[i].path = '/nxt';
        result[i].method = 'POST';
        result[i].headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
        if (result[i].transport === 'https') {
          result[i].tls = {
            rejectUnauthorized: false,
          };
        }
      }

      console.log(JSON.stringify(result, null, 2));
    };

    client.request('getPeers', params, onGetPeers);
  }

getServerList();
