const assert = require('assert');
const plugin = require('../app/lib/plugin');

describe('plugin', function() {
  it('gets list of plugin dirs', function(done) {
    const list = plugin.getPluginList();
    assert((list instanceof Array), true);
    done();
  });
  it('loads a plugin', function(done) {
    const pluginInfo = plugin.loadPlugin('start')
    assert.equal(pluginInfo.name, 'start');
    done();
  });
  it('fails to load plugin', function(done) {
    assert.throws(
      () => {
        plugin.loadPlugin('_start');
      },
      Error
    );
    done();
  });
});
