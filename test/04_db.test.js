const { assert, expect } = require('chai');

describe('Application DB', () => {

  it('Is loaded', done => {
    expect(Relief.db.app).not.empty;
    done();
  });

  it('#getDoc', done => {
    Relief.db.app.getDoc().then(doc => {
      assert.typeOf(doc, 'object');
      expect(doc.users).empty;
      done();
    });
  });

  it('#update', done => {
    Relief.db.app.update({ hello: 'world' })
    .then(Relief.db.app.getDoc)
    .then(doc => {
      assert.equal(doc.hello, 'world');
      done();
    }, err => {
      console.log(err.stack);
    });
  });

  it('#updateDoc', () => {
    Relief.db.app.updateDoc({ bonjour: 'la monde' })
    .then(Relief.db.app.getDoc)
    .then(doc => {
      assert.equal(doc.bonjour, 'la monde');
      expect(doc.hello).to.be.undefined;
      done();
    }, err => {
      console.log(err.stack);
    });
  });

  it('#upsert', () => {
    Relief.db.app.upsert({ newkey: 'newvalue' })
    .then(Relief.db.app.getDoc)
    .then(doc => {
      assert.equal(doc.newkey, 'newvalue');
      assert.equal(doc.keys().length, 2);
      done();
    }, err => {
      console.log(err.stack);
    });
  });
});
