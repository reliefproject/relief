const path = require('path');
const gulp = require('gulp');
const jetpack = require('fs-jetpack');
const NxtClient = require('nxt-wrapper');

let client;

function request(params) {
  return new Promise((resolve, reject) => {
    client.request('getPeers', params, data => {
      if (!data || typeof data !== 'object') {
        throw new Error('Could not get server list');
      }
      resolve(data);
    });
  });
};

function getList() {

  let apiServers = {};
  let apiSslServer = {};
  let params = {
    active: true,
    service: 'API',
    includePeerInfo: true,
  };

  return request(params).then(data => {

    apiServers = data.peers;
    params.service = 'API_SSL';
    return request(params);

  }).then(data => {

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

    return JSON.stringify(result, null, 2);

  });
};

gulp.task('peers_nxt', () => {

  client = new NxtClient({
    protocol: 'http',
    host: '127.0.0.1',
    port: 7876,
    eventLoop: false,
  });

  getList().then(data => {
    const file = path.join(__dirname, '..', 'app', 'data', 'servers_nxt.json');
    jetpack.write(file, data);
  }, err => {
    console.log(err.stack);
  });
});

gulp.task('peers_nxt_test', () => {

  client = new NxtClient({
    protocol: 'http',
    host: '127.0.0.1',
    port: 6876,
    eventLoop: false,
  });

  getList().then(data => {
    const file = path.join(__dirname, '..', 'app', 'data', 'servers_nxt_testnet.json');
    jetpack.write(file, data);
  }, err => {
    console.log(err.stack);
  });

});


gulp.task('updatepeers', ['peers_nxt', 'peers_nxt_test']);
