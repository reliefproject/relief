const { remote } = require('electron');
const User = remote.require('./lib/user');
const Nxt = remote.require('./lib/blockchain/nxt');
const DbManager = remote.require('./lib/db/db_manager');
const db = new DbManager();

global.Relief = remote.getGlobal('Relief');

// Electron
Relief.app = remote.require('electron').app;
Relief.clipboard = remote.require('electron').clipboard;

// Libs
Relief.env = remote.require('./lib/env');
Relief.log = remote.require('./lib/log');
Relief.i18n = remote.require('./lib/i18n');
Relief.plugin = remote.require('./lib/plugin');
Relief.crypto = {
  generatePassphrase: remote.require('./lib/crypto/passphrase').generate,
};
Relief.user = new User();
Relief.nxt = new Nxt();
Relief.db = { app: db.get('app'), user: db.get('user'), };

// External libs
Relief.lib = {
  nxtjs: remote.require('nxtjs'),
  nxtpm: remote.require('nxtpm'),
};
