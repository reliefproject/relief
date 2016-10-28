var jetpack = require('fs-jetpack');
var crypto = require('crypto');
var assert  = require('assert');

var MaxUInt = 4294967295;

/**
 * Based on
 * https://github.com/my8bird/nodejs-secure-random
 */
function _parseArgs(arg_array) {
  if (arg_array.length === 0) {
    throw new Error('Atleast a callback argument is required');
  }
  var is_range = arg_array.length > 2;

  return {
    cb:  arg_array[arg_array.length - 1],
    min: is_range ? arg_array[0] : undefined,
    max: is_range ? arg_array[1] : undefined,
  };
}

/** Map random int to the range so that an even distrobution of results is possible
 *
 * Using this method ensures an even distrobution of as opposed to the modulo
 * technique is is biased.
 *
 * @see http://mathoverflow.net/questions/35556/skewing-the-distribution-of-random-values-over-a-range
 * for an explaination of the modulo issue.
 */
function _mapToRange(min, max, randUInt) {
  var result_range = (max + 1) - min,
  factor = result_range / MaxUInt;

  return ((randUInt * factor) + min) >> 0; // Bitshifting by zero equates to Math.floor, albeit faster.
}

/**
 * Returns a random unsigned Int
 * Returns the random int returned by nodes crypto library
*/
var getRandomInt = function(min, max, callback) {

  var args = _parseArgs(arguments), unsigned_int, rand_int;

  crypto.randomBytes(8, function(err, bytes_slow_buf) {
    if (err) {
      return cb(err);
    }

    unsigned_int = Buffer(bytes_slow_buf).readUInt32LE(0);

    if (args.min !== undefined) {
      assert(args.max !== undefined && args.min < args.max);
      rand_int = _mapToRange(args.min, args.max, unsigned_int);

    } else {
      rand_int = unsigned_int;
    }

    args.cb(null, rand_int);
  });
};

/**
 * Generate a passphrase
 */
var generatePassphrase = function(words, callback) {

  var count = 0;
  var phrase = '';
  var wordlistJSON = jetpack.read(__dirname + '/data/wordlist.json');
  var wordlist = JSON.parse(wordlistJSON);

  for (var i = 0; i < words; i++) {

    getRandomInt(0, wordlist.length - 1, function(err, value) {
      count++;
      phrase += wordlist[value];

      if (count < words) phrase += ' ';
      else callback(phrase);
    });
  }
};


/**
 * Export module
 */
module.exports = {
  generate: generatePassphrase,
};
