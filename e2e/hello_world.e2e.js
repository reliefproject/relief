import { expect } from 'chai';
import testUtils from './utils';

describe('application launch', function() {

    beforeEach(testUtils.beforeEach);
    afterEach(testUtils.afterEach);

    it('Main window is visible', function() {

      return this.app.client.isVisible('.window').then(visible => {
        expect(visible).to.equal(true);
      });

    });


  });
