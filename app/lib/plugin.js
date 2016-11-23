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


const info = name => nxtpm.info(name);
const install = name => nxtpm.install(name, pluginDir);
const expandManifest = nxtpm.manifest.expand;


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


const getList = () => {
  let list = {};
  const dirs = jetpack.list(pluginDir);
  for (let plugin of dirs) {
    list[plugin] = getManifest(plugin);
  }
  return list;
};


const remove = name => {
  const dir = path.join(pluginDir, name);
  if (jetpack.exists(dir) !== 'dir') {
    return;
  }
  jetpack.remove(dir);
};


module.exports = {
  getManifest,
  getList,
  remove,
  info,
  install,
  expandManifest,
};
