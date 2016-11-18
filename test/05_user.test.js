const { assert, expect } = require('chai');
const jetpack = require('fs-jetpack');

describe('User', () => {

  const user = { username: 'dummy', password: '1234567890', };

  it('#create', done => {
    Relief.user.create(user)
    .then(Relief.db.app.getDoc)
    .then(doc => {
      expect(doc.users).to.have.all.keys(['dummy']);
      return Relief.user.create(user);
    })
    .then(() => {}, err => {
      assert.instanceOf(err, Error);
      done();
    });
  });

  it('#login', done => {
    Relief.user.login('nobody', 'pass')
    .then(() => {}, err => {
      assert.instanceOf(err, Error);
      return Relief.user.login(user.username, 'incorrect');
    })
    .then(() => {}, err => {
      assert.instanceOf(err, Error);
      return Relief.user.login(user.username, user.password);
    })
    .then(Relief.db.user.getDoc)
    .then(doc => {
      assert.equal(doc.username, user.username);
      done();
    }, err => {
      console.log(err.stack);
    });
  });

  it('#exportKeys', done => {
    const file = '/tmp/relief_keys.json';
    jetpack.remove(file);
    Relief.user.exportKeys('json', file)
    .then(() => {
      const contents = jetpack.read(file, 'json');
      expect(contents).to.have.all.keys(['nxt']);
      done();
    }, err => {
      console.log(err.stack)
    })
  });

  it('#importKeys', done => {
    const file = path.join(__dirname, 'data', 'relief_keys.json');
    const data = jetpack.read(file);
    Relief.user.importKeys(data)
    .then(Relief.db.user.getDoc)
    .then(doc => {
      const jsonData = JSON.parse(data);
      assert.deepEqual(doc.addresses, jsonData);
      done();
    }, err => {
      console.log(err.stack);
    });
  });

  it('#logout', function(done) {
    Relief.user.logout();
    const isLoggedIn = Relief.user.isLoggedIn();
    assert.equal(isLoggedIn, false);
    done();
  });

});
