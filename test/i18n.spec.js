const assert = require('assert');
const i18n = require('../app/lib/i18n');

describe('i18n', function() {
  it('loads the translation strings', function(done) {
    i18n.loadStrings('en', 'app')
    .then(function(strings) {
      assert.equal(strings.BTN_CLOSE, 'Close');
      done();
    }, function(err) {
      console.log(err);
      assert(false);
      done();
    });
  });
});
