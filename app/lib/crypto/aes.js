const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

module.exports = {

  encryptData: (data, key) => {

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    const result = {
      content: encrypted,
      tag: tag,
      iv: iv.toString('hex'),
    };

    return JSON.stringify(result);

  },

  decryptData: (data, key) => {

    data = JSON.parse(data);
    const iv = new Buffer(data.iv, 'hex');
    const tag = new Buffer(data.tag.data);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);
    let dec = decipher.update(data.content, 'hex', 'utf8')
    dec += decipher.final('utf8');

    return dec;
  },
};
