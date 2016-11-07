const { remote } = require('electron');

global.Relief = remote.getGlobal('Relief');

Relief.clipboard = remote.require('electron').clipboard;
Relief.env = remote.require('./lib/env');
Relief.log = remote.require('./lib/log');
Relief.i18n = remote.require('./lib/i18n');
Relief.plugin = remote.require('./lib/plugin');
Relief.crypto = {
  generatePassphrase: remote.require('./lib/crypto/passphrase').generate,
};
Relief.blockchain = remote.require('./lib/blockchain/blockchain');
Relief.db = remote.require('./lib/persistence/persistence').db;
Relief.user = remote.require('./lib/user');

// Shortcuts
Relief.nxt = Relief.blockchain.bc.nxt;
