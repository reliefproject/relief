const { assert, expect } = require('chai');

describe('Plugin', () => {

  it('#getManifest', done => {
    const manifest = Relief.plugin.getManifest('apps');
    assert.equal(manifest.name, 'apps');
    done();
  });

  it('#info', done => {
    Relief.plugin.info('test6')
    .then(data => {
      assert.equal(data.manifest.name, 'test6');
      assert.equal(data.transaction.name, 'test6');
      done();
    }, err => {
      console.log(err.stack);
    });
  });

  it('#install', done => {
    Relief.plugin.install('test6')
    .then(() => {
      const manifest = Relief.plugin.getManifest('test6');
      assert.equal(manifest.name, 'test6');
      done();
    }, err => {
      console.log(err.stack);
    });
  });

});
