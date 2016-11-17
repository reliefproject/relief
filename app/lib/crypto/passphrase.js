// Random based on https://github.com/my8bird/nodejs-secure-random

const jetpack = require('fs-jetpack');
const crypto = require('crypto');
const assert  = require('assert');
const MaxUInt = 4294967295;


const mapToRange = function(min, max, randUInt) {
  const resultRange = (max + 1) - min;
  const factor = resultRange / MaxUInt;
  return ((randUInt * factor) + min) >> 0;
}


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


const generatePassphrase = function(words) {
  let count = 0;
  let phrase = '';
  const wordlist = JSON.parse(
    jetpack.read(__dirname + '/data/wordlist.json')
  );
  return new Promise((resolve, reject) => {
    for (let i = 0; i < words; i++) {
      getRandomInt(0, wordlist.length - 1).then(value => {
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


module.exports = {
  generate: generatePassphrase,
};
