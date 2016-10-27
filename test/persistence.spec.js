const assert = require('assert')
const path = require('path');
const jetpack = require('fs-jetpack')
const { app } = require('electron');
const env = require('../app/lib/env');
const persistence = require('../app/lib/persistence/persistence');

const appDbFile = path.join(
  app.getPath('userData'),
  env.dbDir,
  env.appDbName + env.dbSuffix
);

const serverDbFile = path.join(
  app.getPath('userData'),
  env.dbDir,
  env.serverDbName + env.dbSuffix
);

describe('persistence init', function() {
  before(function() {
    jetpack.remove(appDbFile);
    jetpack.remove(serverDbFile);
  });

  it('create application DB', function() {
    persistence.init(function(err) {
      const file = jetpack.exists('appDbFile');
      assert.equal(err, undefined);
      assert.equal(file, 'file');
    });
  });

  it('create server DB', function() {
    persistence.init(function(err) {
      const file = jetpack.exists('serverDbFile');
      assert.equal(err, undefined);
      assert.equal(file, 'file');
    });
  });

  after(function() {
    jetpack.remove(appDbFile);
    jetpack.remove(serverDbFile);
  });
});
