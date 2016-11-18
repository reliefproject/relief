const path = require('path');
const { remote } = require('electron');

const _require = file => {
  return remote.require(
    path.join(process.cwd(), 'app', file)
  );
};

const User = _require('lib/user');
const Nxt = _require('lib/blockchain/nxt');
const DbManager = _require('lib/db/db_manager');
const db = new DbManager();

global.Relief = remote.getGlobal('Relief');

const api = {

  // Electron
  app: remote.require('electron').app,
  clipboard: remote.require('electron').clipboard,

  // Libs
  env: _require('lib/env'),
  log: _require('lib/log'),
  i18n: _require('lib/i18n'),
  plugin: _require('lib/plugin'),
  crypto: {
    generatePassphrase: _require('lib/crypto/passphrase').generate,
  },
  user: new User(),
  nxt: new Nxt(),
  db: {
    app: db.get('app'),
    get user() {
      return db.get('user');
    },
  },

  // External Libs
  lib: {
    nxtjs: _require('node_modules/nxtjs'),
    nxtpm: _require('node_modules/nxtpm'),
  },

};

Object.assign(Relief, api);
