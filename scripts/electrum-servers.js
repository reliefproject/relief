const ElectrumClient = require('electrum-wrapper');

const client = new ElectrumClient({
  protocol: 'tcp',
  host: 'electrum.online',
  port: 50001,
});

client.on('error', function(err) {
  log.error(err);
});

const isOnion = function(str) {
  return (str.slice(-5) === 'onion');
};

const getServerList = function(callback) {
  client.request('server.peers.subscribe', [], function(data) {
    if (!data || typeof data !== 'object') {
      return console.log('Could not get server list');
    }
    let result = [];
    const serverList = data.result;
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
        result.push({
          protocol: protocol,
          host: host,
          ip: ip,
          port: port,
          version: version,
          limit: limit,
        });
      }
    }
    callback(result);
  });
};

const formatResult = function(data) {
  let result = [];
  for (var k in data) {
    const server = data[k];
    if (server.limit < 10000) {
      continue;
    }
    if (isOnion(server.host)) {
      continue;
    }
    if (server.protocol !== 'tcp' && server.protocol !== 'tls') {
      continue;
    }
    let record = {
      transport: server.protocol,
      host: server.host,
      port: server.port,
    };
    if (server.protocol === 'tls') {
      record.tls = {
        rejectUnauthorized: false,
      };
    }
    result.push(record);
    client.exit();
  }
  console.log(JSON.stringify(result, null, 2));
  process.exit();
};

getServerList(formatResult);
