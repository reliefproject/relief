(function() {

  const jetpack = require('fs-jetpack');
  const crypto = require('crypto');
  const assert  = require('assert');
  const MaxUInt = 4294967295;

  /**
   * Based on https://github.com/my8bird/nodejs-secure-random
   *
   * Map random int to the range so that an even distrobution of results is possible
   *
   * Using this method ensures an even distrobution of as opposed to the modulo
   * technique is is biased.
   *
   * @see http://mathoverflow.net/questions/35556/skewing-the-distribution-of-random-values-over-a-range
   * for an explaination of the modulo issue.
   */
  const mapToRange = function(min, max, randUInt) {
    const resultRange = (max + 1) - min;
    const factor = resultRange / MaxUInt;
    // Bitshifting by zero equates to Math.floor, albeit faster.
    return ((randUInt * factor) + min) >> 0;
  }

  /**
   * Returns a random unsigned Int
   * Returns the random int returned by nodes crypto library
  */
  const getRandomInt = function(min, max) {
    let unsignedInt;
    let randInt;
    return new Promise(function(resolve, reject) {
      crypto.randomBytes(8, function(err, bytesSlowBuf) {
        if (err) {
          return reject(err);
        }
        unsignedInt = Buffer(bytesSlowBuf).readUInt32LE(0);
        if (min !== undefined) {
          assert(max !== undefined && min < max);
          randInt = mapToRange(min, max, unsignedInt);
        } else {
          randInt = unsignedInt;
        }
        resolve(randInt);
      });
    });
  };

  /**
   * Generate a passphrase
   */
  const generatePassphrase = function(words) {
    let count = 0;
    let phrase = '';
    const wordlist = JSON.parse(
      jetpack.read(__dirname + '/data/wordlist.json')
    );
    return new Promise(function(reoslve, reject) {
      for (let i = 0; i < words; i++) {
        getRandomInt(0, wordlist.length - 1).then(function(value) {
          count++;
          phrase += wordlist[value];
          if (count < words) {
            phrase += ' ';
          } else {
            resolve(phrase);
          }
        });
      }
    });
  };


  /**
   * Export module
   */
  module.exports = {
    generate: generatePassphrase,
  };

})();
