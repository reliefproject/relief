const { assert, expect } = require('chai');
const path = require('path');
const jetpack = require('fs-jetpack');


describe('Environment', () => {
  it('Loads environment variables', done => {
    assert.equal(Relief.env.name, 'test');
    done();
  });
});


describe('Log', () => {
  it('Has a logger instance', done => {
    assert.typeOf(Relief.log, 'object');
    done();
  });
  it('Logs to file', done => {
    const logFile = path.join(
      Relief.log.transports.file.dirname,
      Relief.log.transports.file.filename
    );
    Relief.log.info('Hello World');
    setTimeout(() => {
      const contents = jetpack.read(logFile);
      expect(contents).not.empty;
      done();
    }, 25)
  });
});


describe('Internationialization', () => {

  it('Has a folder for each language', done => {
    const dirs = jetpack.list(
      path.join(
        Relief.env.getPath('common'),
        'i18n'
      )
    );
    for (let lang of Relief.env.languages) {
      assert.notEqual(dirs.indexOf(lang.id), -1);
    }
    done();
  });

  it('Loads the i18n strings', done => {
    const strings = Relief.i18n.load('de', ['common', 'keys']);
    assert.typeOf(strings.de, 'object');
    assert.typeOf(strings.en, 'object');
    done();
  });

});
