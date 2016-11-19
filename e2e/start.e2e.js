const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

import { expect } from 'chai';
import testUtils from './utils';

describe('application launch', function() {

    beforeEach(testUtils.beforeEach);
    afterEach(testUtils.afterEach);
    beforeEach(function() {
      chaiAsPromised.transferPromiseness = this.app.transferPromiseness;
    });

    it('Main window is visible', function() {
      return this.app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(2)
      .isVisible('.window').then(visible => {
        expect(visible).to.equal(true);
      })
      .windowByIndex(1).isVisible('.container').then(visible => {
        expect(visible).to.equal(true);
      });
    });

  });
