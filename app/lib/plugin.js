const path = require('path');
const jetpack = require('fs-jetpack');
const nxtpm = require('nxtpm');
const env = require('./env');
const log = require('./log');
const Nxt = require('./blockchain/nxt');


const pluginDir = env.getPath('plugin', env.standalone);


const nxtList = new Nxt().getServerList();
nxtpm.setConfig('nxt:serverList', nxtList);
nxtpm.setConfig('nxt:numSources', env.nxtNumSources);


const info = name => nxtpm.Package.getPackageInfo(name);
const install = name => nxtpm.Package.install(name, pluginDir);


const getManifest = name => {
  log.info('Get manifest of', name);
  const dir = path.join(pluginDir, name);
  if (jetpack.exists(dir) !== 'dir') {
    throw new Error('Plugin not found');
  }
  const manifestFile = path.join(dir, env.pluginManifest);
  if (jetpack.exists(manifestFile) !== 'file') {
    throw new Error('Manifest file not found');
  }
  let manifest = {};
  return manifest = JSON.parse(
    jetpack.read(manifestFile)
  );
};


module.exports = {
  getManifest,
  info,
  install,
};
