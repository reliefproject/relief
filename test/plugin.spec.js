const assert = require('assert');
const plugin = require('../app/lib/plugin');

describe('plugin', function() {
  it('gets list of plugin dirs', function(done) {
    const list = plugin.getPluginList();
    assert((list instanceof Array), true);
    done();
  });
  it('loads a plugin', function(done) {
    plugin.loadPlugin('start', function(err, pluginInfo) {
      assert.equal(err, undefined);
      assert.equal(pluginInfo.name, 'start');
      done();
    });
  });
  it('fails to load plugin', function(done) {
    plugin.loadPlugin('_start', function(err, pluginInfo) {
      assert.equal((err instanceof Error), true);
      done();
    });
  });
});
