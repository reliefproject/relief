(function() {

  const jetpack = require('fs-jetpack');
  const crypto = require('crypto');
  const assert  = require('assert');
  const MaxUInt = 4294967295;

  /**
   * Based on
   * https://github.com/my8bird/nodejs-secure-random
   */
  const parseArgs = function(argArray) {
    if (argArray.length === 0) {
      throw new Error('Atleast a callback argument is required');
    }
    var isRange = argArray.length > 2;

    return {
      cb:  argArray[argArray.length - 1],
      min: isRange ? argArray[0] : undefined,
      max: isRange ? argArray[1] : undefined,
    };
  };

  /** Map random int to the range so that an even distrobution of results is possible
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
  var getRandomInt = function(min, max, callback) {
    const args = parseArgs(arguments);
    let unsignedInt;
    let randInt;
    crypto.randomBytes(8, function(err, bytesSlowBuf) {
      if (err) {
        return cb(err);
      }
      unsignedInt = Buffer(bytesSlowBuf).readUInt32LE(0);
      if (args.min !== undefined) {
        assert(args.max !== undefined && args.min < args.max);
        randInt = mapToRange(args.min, args.max, unsignedInt);
      } else {
        randInt = unsignedInt;
      }
      args.cb(null, randInt);
    });
  };

  /**
   * Generate a passphrase
   */
  const generatePassphrase = function(words, callback) {
    let count = 0;
    let phrase = '';
    const wordlist = JSON.parse(
      jetpack.read(__dirname + '/data/wordlist.json')
    );

    for (let i = 0; i < words; i++) {
      getRandomInt(0, wordlist.length - 1, function(err, value) {
        count++;
        phrase += wordlist[value];
        if (count < words) {
          phrase += ' ';
        } else {
          callback(phrase);
        }
      });
    }
  };


  /**
   * Export module
   */
  module.exports = {
    generate: generatePassphrase,
  };

})();
