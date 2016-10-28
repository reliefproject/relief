const assert = require('assert');
const i18n = require('../app/lib/i18n');

describe('i18n', function() {
  it('loads the translation strings', function(done) {
    i18n.loadStrings('en', function(err, strings) {
      assert.equal(err, undefined);
      assert.equal(strings['app'].APP_NAME, 'Relief');
      done();
    });
  });
  it('does not load translation strings', function(done) {
    i18n.loadStrings('yxz', function(err, strings) {
      assert((err instanceof Error), true);
      done();
    });
  });
});
