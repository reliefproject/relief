const assert = require('assert');
const i18n = require('../app/lib/i18n');

describe('i18n', function() {
  it('loads the translation strings', function(done) {
    i18n.loadStrings('en', 'app')
    .then(function(strings) {
      assert.equal(strings['app'].APP_NAME, 'Relief');
      done();
    }, function(err) {
      console.log(err);
      assert(false);
      done();
    });
  });
  it('does not load translation strings', function(done) {
    i18n.loadStrings('yxz', 'abc')
    .then(undefined, function(err) {
      assert(err, 'Unknown language');
      done();
    });
  });
});
